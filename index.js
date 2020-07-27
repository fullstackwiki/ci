"use strict";

var child_process = require('child_process');
//var libgit = require('isomorphic-git');

// Deployments API example
// See: https://developer.github.com/v3/repos/deployments/ to learn more

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = function(app){
	// Your code here
	app.log('Yay, the app was loaded!');
	// app.on(['pull_request.opened', 'pull_request.synchronized'], async function(context){
	app.on(['push'], async function(context){
		var event = context.payload;

		// app.log(event);

		if(event.ref !== 'refs/heads/master'){
			app.log('Event not for master branch');
			return;
		}

		if(!event.repository){
			app.log('Event has no repository property');
			return;
		}

		if(!event.head_commit){
			app.log('Event has no head_commit property');
			return;
		}

		var ref = event.head_commit.id;

		// Probot API note: context.repo() => { username: 'hiimbex', repo: 'testing-things' }
		const res = {} || await context.github.repos.createDeployment(context.repo({
			// The ref to deploy. This can be a branch, tag, or SHA.
			ref: ref,

			task: 'deploy', // Specifies a task to execute (e.g., deploy or deploy:migrations).

			// Attempts to automatically merge the default branch into the requested ref, if it is behind the default branch.
			//auto_merge: true,

			// The status contexts to verify against commit status checks.
			// If this parameter is omitted, then all unique contexts will be verified before a deployment is created.
			// To bypass checking entirely pass an empty array. Defaults to all unique contexts.
			required_contexts: [],

			// JSON payload with extra information about the deployment. Default: ""
			payload: {},
			environment: 'production',
			description: 'master branch deployment',
			transient_environment: false,
			production_environment: true,
		}));

		// await libgit.clone({
		// 	dir: 'checkout.git',
		// 	url: event.repository.clone_url,
		// 	ref: ref,
		// });
		var spawnArgs = [__dirname+'/setup.sh', event.repository.clone_url, ref];
		// var spawnEnv = Object.create(process.env);
		// spawnEnv.FORCE_COLOR = 2;
		// var spawnOpts = { env: spawnEnv,	};
		console.log('Spawn build...', spawnArgs);
		var child = child_process.spawn('/bin/bash', spawnArgs);
		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stdout);
		// child.stdout.on('data', function(){ });
		await new Promise(function(resolve, reject){
			child.on('close', resolve);
		});
		console.log('Done');

		return;
		const deploymentId = res.data.id;
		await context.github.repos.createDeploymentStatus(context.repo({
			deployment_id: deploymentId,
			state: 'success', // The state of the status. Can be one of error, failure, inactive, pending, or success
			log_url: 'https://fullstack.wiki/ci/'+deploymentId+'.xhtml', // The log URL to associate with this status. This URL should contain output to keep the user updated while the task is running or serve as historical information for what happened in the deployment.
			description: 'My Probot App set a deployment status!', // A short description of the status.
			environment_url: 'https://fullstack.wiki/', // Sets the URL for accessing your environment.
			auto_inactive: true, // Adds a new inactive status to all prior non-transient, non-production environment deployments with the same repository and environment name as the created status's deployment. An inactive status is only added to deployments that had a success state.
		}));
	});

	app.on(['check_suite.requested', 'check_run.rerequested'], async function check(context){
		var event = context.payload;
		// app.log(event);

		const startTime = new Date();
		const head_sha = event.check_suite.head_sha;

		var check = await context.github.checks.create(context.repo({
			name: 'Fullstack.wiki CI',
			head_branch: event.check_suite.head_branch,
			head_sha: event.check_suite.head_sha,
			details_url: 'https://fullstack.wiki/ci/'+head_sha,
			status: 'queued',
			started_at: startTime,
		}));
		await new Promise(function(resolve, reject){ setTimeout(resolve, 5000); });
		var check = await context.github.checks.create(context.repo({
			name: 'Fullstack.wiki CI',
			head_branch: event.check_suite.head_branch,
			head_sha: event.check_suite.head_sha,
			details_url: 'https://fullstack.wiki/ci/'+head_sha,
			status: 'in_progress',
			started_at: startTime,
		}));
		await new Promise(function(resolve, reject){ setTimeout(resolve, 5000); });
		return context.github.checks.create(context.repo({
			check_run_id: check.data.id,
			name: 'Fullstack.wiki CI',
			head_branch: event.check_suite.head_branch,
			head_sha: event.check_suite.head_sha,
			details_url: 'https://fullstack.wiki/ci/'+head_sha,
			status: 'completed',
			started_at: startTime,
			conclusion: 'success',
			completed_at: new Date(),
			output: {
				title: 'Formatting',
				summary: 'The check has passed!',
			},
		}));
	});

	// For more information on building apps: https://probot.github.io/docs/
	// To get your app running against GitHub, see: https://probot.github.io/docs/development/
};

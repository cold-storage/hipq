# Persistent State

## Job Instance

* id
* job_type
* job_key
* state
* error
* attempt
* scheduled_run_time
* create_time
* update_time

```id``` a numeric surrogate key.

```job_type``` a string key that defines the type of job.
Each job type runs a different bit of code.

```job_key``` a string key that is unique per job type. Allows us to map results of an external asynchronous process back to a particular job instance. There may be multiple of the same value for job_key per job_type in final state, but there will only ever be on job instance for a given job_type / job_key in non-final state.

```state``` will be one of ```initial``` ```running``` ```error``` ```final```.

```error``` will be some text or JSON indicating an error.

```attempt``` is an integer value that says how many times we tried to run the job. If the value is 0 we haven't tried to run the job yet.
If the value is 3 we are on our third try.

```scheduled_run_time``` is the time we want the job to run.

```create_time``` is the time this database record was created.

```update_time``` is the time this database record was updated.

### States

In initial state error will be the string NONE. This is the initial state of a job before we try to run it. 

Initial state will only transition to running state.

* state: initial
* error: NONE

In running state error will be the string NONE. Running state indicates the app is trying to run the job.

Running state may transition to error state or final state.

* state: running
* error: NONE

In error state error will be some JSON or text that describes the error. 

Error state may transition back to running state or to final state.

* state: error
* error: some JSON or text indicating error

In final state, error may be NONE or some JSON or text indicating an error. Final state means we will never try to re-run the job. It's finished.

* state: final
* error: NONE or JSON/string indicating error

Final state will never change. It's final.

#### Persistent State vs Actual State

It's very important to distinguish between persistent state and actual state. The states described above (and the only thing we ever know for sure) are the persistent state -- the actual values currently in the database. 

Persistent state may be initial, but the job is actually running. If the app crashes before it has a chance to update the state it will likely run the job again when it restarts. 

All jobs must be able to tolerate being re-run. We make an absolute guarantee that your job will be run. But it may be run more than once.

As another example, persistent state may be running, but the app has crashed. Now when the app starts back up, the job isn't really running. 

In this case if you have no retry logic, your job is toast. It will end up at some time hitting the timeout limit and we will send it to final state with a timeout error.

If you have retry logic, it will still end up hitting the timeout at some point, but your retry logic will take care of trying the job again.

With timeouts and retry logic you can control exactly what you want to happen and guarantee that your job will not end up in a black hole no matter how badly your app crashes.

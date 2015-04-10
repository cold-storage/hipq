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

In initial state error will be NONE. This is the initial state of a job before we try to run it. 

Initial state will only transition to running state.

* state: initial
* error: NONE

In running state error will be NONE. Running state indicates the app said it's trying to run the job. It may or may not have failed or timed out by now. All we know for sure is that we think it's running.

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

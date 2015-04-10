# Persistent State

## Job Instance

* id
* job_type
* job_key
* status
* error
* attempt
* scheduled_run_time
* create_time
* update_time

```id``` a numeric surrogate key.

```job_type``` a string key that defines the type of job.
Each job type runs a different bit of code.

```job_key``` a string key that is unique per job type. Allows us to map results of an external asynchronous process back to a particular job instance. There may be multiple of the same value for job_key per job_type in done status, but there will only ever be on job instance for a given job_type / job_key in non-done status.

```status``` will be one of ```initial``` ```running``` ```error``` ```done```.

```error``` will be some text or JSON indicating an error.

```attempt``` is an integer value that says how many times we tried to run the job. If the value is 0 we haven't tried to run the job yet.
If the value is 3 we are on our third try.

```scheduled_run_time``` is the time we want the job to run.

```create_time``` is the time this database record was created.

```update_time``` is the time this database record was updated.


# Persistent State

Job Instance

* id
* job_type
* status
* attempt
* scheduled_run_time
* create_time
* udpate_time

```job_type``` is any unique string key that defines the type of the job.
Each job type runs a different bit of code.

```status``` will be one of ```initial``` ```running```

```attempt``` is an integer value that says how many attempts we have
made to run the job successfully. If 0, that means we haven't tried.
If 3, that means we are on our third try.

```scheduled_run_time``` is the time we want the job to run.

```create_time``` is the time this database record was created.

```update_time``` is the time this database record was updated.


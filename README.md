# hipq

A job queue service for Node.js specifically for jobs that interact with
external services by sending and receiving messages in a decoupled fashion.
Maybe you send a message over Kafka or Amazon Kinesis and get a resonse back in
another message. Or you do an HTTP request and include a callback URL where the
service can send back information at a later time.

Our first use case was sending an HTTP request and eventually we get a response
back from Kafka.

One hard requirement is there must be some way to map the response message with
the request message. Both the request and the response message must have some
unique information that can be used to build a string key to match up the two.

## Status

We are in requirements definition mode. If we find a mature product that meets
our needs, this project may be abandoned.

## Features

We provide the following features for these types of jobs.

* Durability
* Scheduling
* Retry
* Timeout
* Priority
* Throttling
* Time Windowing

Ultra low latency and super high throughput are not high priorities. We probably
can't queue hundreds or thousands of jobs per second. We also can't guarantee
jobs will run within seconds of their scheduled time. We tolerate occasional
latency of half a minute or so.

### Durability

Once a job is successfully queued, we guarantee it will not be lost. It will run
at the proper time (or as soon after that as possible) even if your application
suffers a hard crash. However, we can't guarantee your job will be run only
once.

### Scheduling

All jobs are scheduled to run at a specific time which defaults to now. Jobs are
not guaranteed to run exactly at the scheduled time. They will run at some point
after the scheduled time depending on their priority and the queue's throttle
settings.

### Retry

Jobs can specify a retry strategy which runs on job failure. The retry strategy
is any arbitrary logic, and it may end up re-queueing the job or not based on
its very awesome logic.

### Timeout

Jobs can specify an amount of time after which a timeout error will be thrown.
The default is 24 hours. It's generally a good idea to specify some reasonable
timeout.

### Throttling

Each queue can have a concurrency limit. The default is unlimited. If the
concurrency limit is 10, no more than 10 jobs will run at a time.

Each job type can have concurrency or throttle factor that attempts to gauge the
amount of effort required by some external system to run the job. So if your
concurrency limit for a given queue is 10 you can run 10 jobs at at time. But if
your jobs have a concurrency factor of 2 that means they are equal to two normal
jobs and you can only run 5 of them at a time.

TODO: We probably need a way to have critical jobs that don't count towards the
throttle limit so we don't starve out other jobs. This could be accomplished by
just not using a queue for those types of jobs, but then you don't get the
benefit of the queue's durability, scheduling, retry and timeout.

### Priority

Priority only matters if throttling is being used.

All jobs have a numeric priority. The default is 100. The lower the number, the
higher the priority. Jobs are taken from the queue by scheduled time then by
priority. Imagine a table sorted first by scheduled time then by priority
ascending.

scheduled time      | priority
:------------------ | -------:
10:32               |      700
10:33               |       50
10:33               |      100
10:40               |        1
10:40               |        7

Alternatively you can configure a queue to sort first by priority then by
scheduled time. Either way there is a risk that higher priority jobs will starve
out lower priority jobs.

For example, lets say you sort by priority first and you have a throttle limit
of ten jobs. Only ten jobs will ever run at a given time. If you always have ten
or more priority one jobs in your queue, priority two or lower jobs will never
run.

### Time Windowing

Jobs can specify one or more time windows within which the job must run. These
are based on time of day. So you can specify that the job must run between 5 and
7 AM or between 10 and 11 PM for example. If a time window is specified we will
automatically schedule the job to run at the first available time (unless you
also specified a scheduled time, then we will use the scheduled time assuming it
is  within the window). If we pull the job off the queue and its window has
already closed, we will re-queue it to run at the next available time.

## Implementation Notes

### Durability

Durability is a high priority for us and super low latency is not. Not sure that
horrizontal scalability is a priority, but probably won't hurt either. If we
implement such that all state is in the database we can probably accomplish both
durability and scalability. With scalability, we also open up the option of
having implementations in languages other than Node.js.

Actually not sure we can or want to horrizontally scale a single queue.
Otherwise you end up with something like Kafka or Knesis. And in that case we
would just want to add priority, retry, throttling, etc to them.

### PostgreSQL Pub-Sub

Looks interesting, but probably want to keep to SQL standard so we can use any
SQL compliant db. http://blog.andyet.com/2015/04/06/postgres-pubsub-with-
json?utm_source=postgresweekly&utm_medium=email

## Database Schema

```
CREATE TABLE job (
  id              serial NOT NULL,
  scheduled_time  timestamp with time zone NOT NULL DEFAULT now(),
  priority        integer NOT NULL DEFAULT 0,
  timeout_seconds integer NOT NULL DEFAULT 86400,
  retry_strategy  text NOT NULL DEFAULT '',

  CONSTRAINT job_pkey PRIMARY KEY (id)
)
```

```
CREATE TABLE time_window (
  id              serial NOT NULL,
  scheduled_time  timestamp with time zone NOT NULL DEFAULT now(),
  priority        integer NOT NULL DEFAULT 0,
  timeout_seconds integer NOT NULL DEFAULT 86400,
  retry_strategy  text NOT NULL DEFAULT '',

  CONSTRAINT job_pkey PRIMARY KEY (id)
)
```
# hipq

A job queue service for Node.js specifically for jobs interact with external
services by sending and receiving messages in a decoupled fashion. Maybe you
send a message over Kafka or Amazon Kinesis and get a resonse back in another
message. Or you do an HTTP request and include a callback URL where the service
can send back information at a later time.

One hard requirement here is that there must be some way to map the response
message with the request message. Both the request and the response message must
have some unique information that can be used to build a string key to match up
the two.

## Features

We provide the following features for these types of jobs.

* Durability
* Scheduling
* Priority
* Throttling
* Retry
* Timeout
* Time Windowing

Ultra low latency and super high throughput are not high priorities. We probably
can't queue hundreds or thousands of jobs per second. We also can't
guarantee jobs will run within seconds of their scheduled time. We tolerate
occasional latency of half a minute or so.

### Durability

Once a job is successfully queued, we guarantee it will not be lost. It will be
run at the proper time (or as soon after that as possible) even if your
application suffers a hard crash.

### Scheduling

All jobs are scheduled to run at a specific time which defaults to the time the
job is added to the queue. Jobs are not guaranteed to run exactly at the
scheduled time. They will run at some point after the scheduled time depending
on their priority and the queue's throttle settings.

### Priority

All jobs have a numeric priority. The default is 100. Jobs are taken from the
queue by priority then by scheduled time. Imagine a table sorted first by
priority ascending, then by scheduled time ascending.

priority | scheduled time
-------: | :------------------
      50 | 10:33
      50 | 10:34
     100 | 10:20
     100 | 10:30

### Throttling

Each queue can have a concurrency limit. The default is unlimited. If the
concurrency limit is 10, we guarantee no more than 10 jobs will run at a time.

### Retry

Jobs can specify a retry strategy which runs on job failure. The retry strategy
is any arbitrary logic and it may end up re-queueing the job or not based on its
very awesome logic.

### Timeout

Jobs can specify an amount of time after which a timeout error will be thrown if
the job has not completed. The default is 24 hours. It's generally a good idea
to specify some reasonable timeout.

### Time Windowing

Jobs can specify one or more time windows within which the job must run. These
are based on time of day. So you can specify that the job must run between 5 and
7 AM or between 10 and 11 PM for example. If a time window is specified we will
automatically schedule the job to run at the first available time (unless you
also specified a scheduled time, then we will use the scheduled time assuming it
is  within the window). If we pull the job off the queue and its window has
already closed, we will re-queue it to run at the next available time.


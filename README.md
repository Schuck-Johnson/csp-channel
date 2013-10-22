#CSP Channel

CSP Channels for Javascript (like channels in Go)

##Motivation

To help in simplifying the handling of asyncronus calls, espically callbacks.  This is
modeled after Clojure's [core.async] [1] library.

##Documentation

Here is a simple demostration of csp channels

```javascript
var chan = csp_channel.chan();
csp_channel.take(chan, function(val) { console.log("Displaying the first value " + val + "."); } );
csp_channel.put(chan, 1729); // Console: "Displaying the first value 1729."
csp_channel.put(chan, 42);
csp_channel.take(chan, function(val) { console.log("Displaying the second value " + val + "."); } );
//Console: "Displaying the first value 42."
csp_channel.take(chan, function(val) {
    if (val === null) {
        console.log("Channel has been closed");
    } else {
        console.log("Channel has not been closed");
    }
});
csp_channel.close(chan); //Console: "Channel has been closed"
```

This demostration show the basic operation of channels starting with creation
```javascript
var success = csp_channel.chan();
var error = csp_channel.chan();
var abort = csp_channel.chan();
```

*Put operation
Putting values onto channels.  The put operation takes a channel and a value as parameters,
with an optional callback.  You can not put null values onto a channel, they are reserved
for signalling a channel is closed. If there are no matching takes on the channel then the
put calls are parked (queued on the channel) waiting for a take call.  The value of null
can not be put onto a channel.
```javascript
//csp_channel.put(<Channel>, <value>, <optional put callback function>);
csp_channel.put(success, 42);
csp_channel.put(error, "Network connection was not found.");
```

* Take operation
Taking values from a channel.  The take operation takes a channel and a function which has
a put value a it's sole parameter.  If the value is null then that signals the channel is
closed.  If there are no matching puts on the channel then the calls are parked.
(queued on the channel) until a put happens.
```javascript
//csp_channel.put(<Channel>, <take callback function which will have the put value as it's parameter>);
csp_channel.take(success, function(val) { console.log("Value (" + val + ") gotten!"); });
csp_channel.take(error, function(val) { console.log("Error: " + val); });
csp_channel.take(abort, function(val) { console.log("Channel has been closed"); });
```

* Close operation
Finally closing a channel.  If there are any parked (queued on the channel) take calls
on the channel then they are call with the value of null.
```javascript
//csp_channel.close(<Channel>);
csp_channel.close(success);
csp_channel.close(error);
csp_channel.close(abort);
```

Here are additional operations in addition to those basic ones.

*Closed channel
This checks if a channel is closed.
```javascript
//csp_channel.closed(<Channel>);
var chan = csp_channel.chan();
if (csp_channel.closed(chan)) {
    console.log("The channel is closed");
}
csp_channel.close(chan);
if (csp_channel.closed(chan)) {
    console.log("Now the channel is closed");
}
```

*Timeout channels
The timeout method creates a method which will close after a set number of milliseconds.
The library has a resolution of 10 milliseconds meaning that if a created timeout channel
will timeout within 10 milliseconds of another one then that channel is used instead.
```javascript
//csp_channel.timeout(<time in milliseconds until the channel is closed>)
var timeout = csp_channel.timeout(1000);
csp_channel.take(timeout, function() { console.log("This is called 1000 ms after channel creation"); });
csp_channel.take(timeout, function() { console.log("This one too!"); });
var time1 = csp_channel.timeout(5);
var time2 = csp_channel.timeout(10); //Is within the 10 milliseconds time1's creation
if (time1 === time2) {
    console.log("time1 === time2");
}
```

*Alts operation
The alts operation allows you to give an list of channels and a take callback that
will park (be queued) until one of the channels has a value put onto it.  The callback
function is given the value as the first parameter and the channel as the second parameter
```javascript
//csp_channel.alts(<array of channels>, <take callback which receives a value and a channel>)
var success = csp_channel.chan();
var error = csp_channel.chan();
var timeout = csp_channel.timeout(1000);
csp_channel.alts([success, error, timeout], function(val, chan) {
    if (success === chan) {
        console.log("Got value from call");
    } else if (error === chan) {
        console.log("Error happened from call");
    } else if (timeout === chan) {
        console.log("Call timed out");
    } else {
        console.log("Unknown channel");
    }
});
var timeout2 = csp_channel.timeout(1000);
csp_channel.alts([success, error, timeout2], function(val, chan) {
    if (success === chan) {
        console.log("Got value from call");
    } else if (error === chan) {
        console.log("Error happened from call");
    } else if (timeout === chan) {
        console.log("Call timed out");
    } else {
        console.log("Unknown channel");
    }
});
csp_channel.put(success, 42);
```

*Buffered channels
Channels can be created with buffers of n size to store values put onto them.  These are
sent as a parameter of the channel creation operation.  If you send a number instead a
fixed buffer is created.  These buffers come in three different flavors.

1.  Fixed buffer:  After n puts into the buffer any puts without corresponding takes are
parked on the channel.
```javascript
var chan = csp_channel.chan(2); //Fixed buffer of size 2
var other_chan = csp_channel.chan(csp_channel.fixed_buffer(2)); //Fixed buffer of size 2
csp_channel.put(chan, 1);
csp_channel.put(chan, 2);
csp_channel.put(chan, 3);
csp_channel.take(chan, function(val) { console.log("First value (" + val + ") put on the buffer"); });
csp_channel.take(chan, function(val) { console.log("Second value (" + val + ") put on the buffer"); });
csp_channel.take(chan, function(val) { console.log("First parked value (" + val + ") of the channel"); });
```

2.  Dropping buffer:  After n puts into the buffer any puts are dropped without parking them on the
channel.
```javascript
var chan = csp_channel.chan(csp_channel.dropping_buffer(2));
csp_channel.put(chan, 1);
csp_channel.put(chan, 2);
csp_channel.put(chan, 3);
csp_channel.take(chan, function(val) { console.log("First value (" + val + ") put on the buffer"); });
csp_channel.take(chan, function(val) { console.log("Second value (" + val + ") put on buffer"); });
csp_channel.take(chan, function(val) { console.log("First value (" + val + ") after others were dropped"); });
csp_channel.put(chan, 4);
```

3.  Sliding buffer:  After n puts into the buffer any further puts the first value is popped off and the
value is added at the end of the buffer.
```javascript
var chan = csp_channel.chan(csp_channel.sliding_buffer(2));
csp_channel.put(chan, 1);
csp_channel.put(chan, 2);
csp_channel.put(chan, 3);
csp_channel.take(chan, function(val) { console.log("Second value (" + val + ") put on the buffer"); });
csp_channel.take(chan, function(val) { console.log("Third value (" + val + ") put on buffer"); });
```

##Uses

* Clearly defining channels of communication within your program.
* Decoupling where events / callbacks firing from where they are acted upon.
* Allows simple testing of events with put operations that send the requiste value
```javascript
var click_chan = csp_channel.chan();
$("#foo").on("click", function() {
    csp_channel.put(click_chan, $("foo").val()); //click event
});
csp_channel.take(click_chan, function(val) {
    console.log("I've been clicked!");
});
csp_channel.put(click_chan, "bar"); //simulated click event
```
* Combining timeout channels and alts to do simple timeout operations.

##Notes

This library is designed to work with require js, AMD and Node with the name csp_channel.
The library is compiled with Google Closure compiler

*channel.dev.js is the development version complete with comments.
*channel.js is the QA or node version and is compiled with simple optimizations.
*channel.prod.js is the broswer production version and is compiled with advanced optimizations.

##Todo

Make channel piping operations that will allow one channel to be transformed into another, one channel to be
split into many and many channels to be combined into one.

    [1]: https://github.com/clojure/core.async "Core Async"

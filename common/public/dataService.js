import app from "../base"

app.service("dataService", ["$rootScope", "$http", "$q",
    function ($rootScope, $http, $q) {
        return {
            callOpenApi: function (api_name, api_params = {}, mode = "main") {
                let defer = $q.defer()
                let _url = "http://" + "127.0.0.1:8080" + "/api/" + mode + "/" + api_name;
                $http.post(_url, api_params).then(function (data) {
                    success_handler(data.data)
                }, function (data) {
                    fail_handler(data.data)
                })

                function success_handler(data) {
                    defer.resolve(data)
                }

                function fail_handler(data) {
                    defer.reject(data)
                }

                return defer.promise;
            },
            // callRabbitmq: function () {
            //     console.log(1111111)
            //     let amqp = require('amqplib/callback_api');
            //     amqp.connect("amqp://admin:201020120402ssS~@1.15.111.85:5672/", function(error0, connection) {
            //         if (error0) {
            //             throw error0;
            //         }
            //         connection.createChannel(function(error1, channel) {
            //             if (error1) {
            //                 throw error1;
            //             }
            //             var exchange = 'cube';
            //             var msg =  'Hello World!';
            //             var severity = 'blog';
            //
            //             channel.assertExchange(exchange, 'direct', {
            //                 durable: false
            //             });
            //             channel.publish(exchange, severity, Buffer.from(msg));
            //             console.log(" [x] Sent %s: '%s'", severity, msg);
            //         });
            //
            //         setTimeout(function() {
            //             process.exit(0)
            //             connection.close();
            //         }, 500);
            //     });
            // }
        }
    }])
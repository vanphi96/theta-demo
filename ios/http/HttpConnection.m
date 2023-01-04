//
//  HttpConnection.m
//  nativeui
//
//  Created by Phi on 04/01/2023.
//

#import "HttpConnection.h"
#import "HttpStream.h"

/**
 * HTTP connection to device
 */
@interface HttpConnection ()
{
    NSString *_server;
    NSURLSession *_session;
    NSMutableArray *_infoArray;
    HttpStream *_stream;
}
@end

@implementation HttpConnection

#pragma mark - Accessors.

/**
 * Specify address of connection destination
 * @param address Address
 */
- (void)setTargetIp:(NSString* const)address;
{
    _server = address;
  NSLog(@"Philv %s", address);
}

/**
 * Status of connection to device
 * @return YES:Connect, NO:Disconnect
 */
- (BOOL)connected
{
    return (_sessionId != nil);
}

#pragma mark - Life cycle.

/**
 * Initializer
 * @return Instance
 */
- (id)init
{
    if (self = [super init]) {
        // Timeout settings
        NSURLSessionConfiguration* config = [NSURLSessionConfiguration defaultSessionConfiguration];
        config.timeoutIntervalForRequest = 5.0;

        _session = [NSURLSession sessionWithConfiguration:config];
    }
    return self;
}

#pragma mark - HTTP Connections.

/**
 * Notify device of continuation of session
 */
- (void)update
{
    if (_sessionId) {
        // Create the url-request.
        NSMutableURLRequest *request = [self createExecuteRequest];

        // Create JSON data
        NSDictionary *body = @{@"name":@"camera.updateSession",
                               @"parameters":
                                   @{@"sessionId":_sessionId}};
        NSData *json = [NSJSONSerialization dataWithJSONObject:body options:0 error:nil];

        // Set the request-body.
        [request setHTTPBody:json];

        // Send the url-request.
        NSURLSessionDataTask* task =
        [_session dataTaskWithRequest:request
                    completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                        NSString *newId = nil;
                        if (!error) {
                            NSArray *array = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
                            newId = [array valueForKeyPath:@"results.sessionId"];
                            NSLog(@"result: %@", newId);
                        } else {
                            NSLog(@"error: %@", error);
                        }

                        if (newId) {
                            _sessionId = newId;
                        }
                    }];
        [task resume];
    }
}

/**
 * Disconnect from device
 * @param block Block called after disconnection process
 */
- (void)close:(void(^ const)())block
{
    if (self->_sessionId) {
        // Stop live view
        [_stream cancel];

        // Create the url-request.
        NSMutableURLRequest *request = [self createExecuteRequest];

        // Create JSON data
        NSDictionary *body = @{
          @"name":@"camera.closeSession",
          @"parameters":
              @{ @"sessionId":self->_sessionId }
        };
        NSData *json = [NSJSONSerialization dataWithJSONObject:body options:0 error:nil];

        // Set the request-body.
        [request setHTTPBody:json];

        // Send the url-request.
        NSURLSessionDataTask* task =
        [self->_session dataTaskWithRequest:request
                         completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                             block();
                         }];
        [task resume];
        self->_sessionId = nil;
    }
}

/**
 * Acquire battery information of device
 * @return Battery level (4 levels: 0.0, 0.33, 0.67 and 1.0)
 */
-(NSNumber*)getBatteryLevel
{
    // Semaphore for synchronization (cannot be entered until signal is called)
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

    // Create the url-request.
    NSMutableURLRequest *request = [self createRequest:@"/osc/state" method:@"POST"];

    __block NSNumber *batteryLevel;

    // Send the url-request.
    NSURLSessionDataTask* task =
    [self->_session dataTaskWithRequest:request
                      completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                          if (!error) {
                              NSArray* array = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
                              NSArray* state = [array valueForKey:@"state"];
                              batteryLevel = [state valueForKey:@"batteryLevel"];
                              NSLog(@"result: %@", batteryLevel);
                          } else {
                              NSLog(@"error: %@", error);
                          }
                          dispatch_semaphore_signal(semaphore);
                      }];
    [task resume];

    // Wait until signal is called
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    return batteryLevel;
}

/**
 * Specify shooting size
 * @param width Width of shot image
 * @param height Height of shot image
 */
- (void)setImageFormat:(NSUInteger)width height:(NSUInteger)height
{
    [self setOptions:@{@"captureMode": @"image"}];
    [self setOptions:@{@"fileFormat":
                           @{@"type": @"jpeg",
                             @"width": [NSNumber numberWithUnsignedInteger:width],
                             @"height": [NSNumber numberWithUnsignedInteger:height]}}];
}

/**
 * Start live view
 * @param block Block called on drawing. Used to perform the drawing process of the image.
 */
- (void)startLiveView:(void(^ const)(NSData *frameData))block
{
        NSMutableURLRequest *request = [self createExecuteRequest];
        _stream = [[HttpStream alloc] initWithRequest:request];
        [_stream setDelegate:block];
        [_stream getData];
}

/**
 * Resume live view
 */
- (void)restartLiveView
{
}

/**
 * Create HTTP request class instance for executing command
 * @return HTTP request class instance for executing command
 */
- (NSMutableURLRequest*)createExecuteRequest
{
    // Create the url-request.
    return [self createRequest:@"/osc/commands/execute" method:@"POST"];
}


/**
 * Send option setting request
 * @param options Dictionary in which the option name and settings were configured for the key and value
 */
- (void)setOptions:(NSDictionary*)options
{
    // Semaphore for synchronization (cannot be entered until signal is called)
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

    // Create the url-request.
    NSMutableURLRequest *request = [self createExecuteRequest];

    // Create JSON data
    NSDictionary *body = @{@"name": @"camera.setOptions",
                           @"parameters":
                               @{
                                 @"options":options}};

    // Set the request-body.
    [request setHTTPBody:[NSJSONSerialization dataWithJSONObject:body options:0 error:nil]];

    // Send the url-request.
    NSURLSessionDataTask* task =
    [self->_session dataTaskWithRequest:request
                      completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                          if (!error) {
                              NSLog(@"result: %@", response);
                          } else {
                              NSLog(@"error: %@", error);
                          }
                          dispatch_semaphore_signal(semaphore);
                      }];
    [task resume];

    // Wait until signal is called
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
}

/**
 * Create HTTP request
 * @param protocol Path
 * @param method Protocol
 * @return HTTP request instance
 */
- (NSMutableURLRequest*)createRequest:(NSString* const)protocol method:(NSString* const)method
{
    NSString *string = [NSString stringWithFormat:@"http://%@%@", _server, protocol];
    NSURL *url = [NSURL URLWithString:string];

    // Create the url-request.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];

    // Set the method(HTTP-POST)
    [request setHTTPMethod:method];

    [request setValue:@"application/json; charaset=utf-8" forHTTPHeaderField:@"Content-Type"];

    return request;
}

@end


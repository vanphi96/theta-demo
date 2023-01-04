//
//  HttpConnection.h
//  nativeui
//
//  Created by Phi on 04/01/2023.
//

#import <Foundation/Foundation.h>

@interface HttpConnection : NSObject

@property (readonly) NSString* sessionId;

- (void)setTargetIp:(NSString* const)server;

- (BOOL)connected;

- (void)update;

- (void)close:(void(^ const)())block;

- (NSNumber*)getBatteryLevel;

- (void)setImageFormat:(NSUInteger)width height:(NSUInteger)height;

- (void)startLiveView:(void(^ const)(NSData *frameData))block;

- (void)restartLiveView;

- (NSMutableURLRequest*)createExecuteRequest;

@end

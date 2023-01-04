//
//  HttpStream.h
//  nativeui
//
//  Created by Phi on 04/01/2023.
//

#import <Foundation/Foundation.h>

@interface HttpStream : NSObject

- (void)setDelegate:(void(^)(NSData *frameData))bufferBlock;

- (id)initWithRequest:(NSMutableURLRequest*)request;

- (void)getData;

- (void)cancel;

@end

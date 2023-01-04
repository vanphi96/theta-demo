#import <React/RCTViewManager.h>
#import "HttpConnection.h"

inline static void dispatch_async_main(dispatch_block_t block)
{
    dispatch_async(dispatch_get_main_queue(), block);
}

inline static void dispatch_async_default(dispatch_block_t block)
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), block);
}

@interface LivePreviewManger:RCTViewManager
{
  NSMutableArray* _objects;
  NSNumber* _batteryLevel;
  HttpConnection* _httpConnection;
  UIView *uiMain;
}
@end

@implementation LivePreviewManger

RCT_EXPORT_MODULE(RCTLivePreviewIOS)
- (UIView *)view
{
  NSString *targetIP = @"192.168.1.1";
  UIImageView *motionJpegView = [[UIImageView alloc]init];
  motionJpegView.image = nil;
  
  _httpConnection = [[HttpConnection alloc] init];
  [_httpConnection setTargetIp:targetIP];
  
  UILabel *labelView = [[UILabel alloc]init];
  UIView *viewMain = [[UIView alloc]init];
  labelView.text = @"Le van phi";
  [labelView setBackgroundColor:[UIColor redColor]];
  motionJpegView.frame = CGRectMake(0, 0, 200, 100);
//  [motionJpegView setBackgroundColor:[UIColor greenColor]];
  [viewMain addSubview:motionJpegView];
  [viewMain setBackgroundColor:[UIColor yellowColor]];
  [self enumerateImages:motionJpegView];
  return motionJpegView;
}


- (void)enumerateImages:(UIImageView*)_motionJpegView
{
    [_objects removeAllObjects];
    
    dispatch_async_default(^{
        // Start live view display
        [_httpConnection startLiveView:^(NSData *frameData) {
            dispatch_async_main(^{
                UIImage *image = [UIImage imageWithData:frameData];
                _motionJpegView.image = image;
              NSLog(@"Philv set image");
            });
        }];
    });
}


@end



import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

export function HomescreenTutorial() {
  const isMobile = useIsMobile();
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("ios");
  
  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setDeviceType("ios");
    } else if (/Android/.test(userAgent)) {
      setDeviceType("android");
    } else {
      setDeviceType("desktop");
    }
  }, []);

  const renderIosTutorial = () => (
    <div className="w-full">
      <img 
        className="w-full rounded-t-lg" 
        src="/untitled%20design.gif"
        alt="Tutorial on how to add Leena.ai to your iPhone homescreen"
        loading="lazy"
      />
      
      <ScrollArea className="h-40 p-4 bg-muted/20">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Steps to add to homescreen:</h3>
            <ol className="list-decimal pl-5 text-sm">
              <li>Tap the <strong>Share</strong> button (the square with arrow) at the bottom of the screen</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
              <li>Tap <strong>Add</strong> in the top-right corner</li>
              <li>Now you can access Leena.ai from your homescreen like any other app!</li>
            </ol>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">
              Note: Adding to homescreen will give you the full app experience with faster loading times and offline capabilities.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  const renderAndroidTutorial = () => (
    <div className="w-full">
      <img 
        className="w-full rounded-t-lg" 
        src="/untitled%20design.gif"
        alt="Tutorial on how to add Leena.ai to your Android homescreen"
        loading="lazy"
      />
      
      <ScrollArea className="h-40 p-4 bg-muted/20">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Steps to add to homescreen:</h3>
            <ol className="list-decimal pl-5 text-sm">
              <li>Tap the menu (⋮) in the top-right of Chrome</li>
              <li>Select <strong>Add to Home screen</strong></li>
              <li>Confirm by tapping <strong>Add</strong></li>
              <li>Now you can access Leena.ai from your homescreen like any other app!</li>
            </ol>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">
              Note: Adding to homescreen will give you the full app experience with faster loading times and offline capabilities.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  const renderDesktopMessage = () => (
    <div className="w-full p-4 text-center">
      <img
        className="mx-auto mb-4 w-36 h-36"
        src="/placeholder.svg"
        alt="Mobile phone icon"
      />
      <h3 className="font-medium mb-2">For the best experience, install the app on your mobile device</h3>
      <p className="text-sm text-muted-foreground">
        Visit Leena.ai on your mobile phone to easily add it to your homescreen.
      </p>
    </div>
  );

  return (
    <>
      {deviceType === "ios" && renderIosTutorial()}
      {deviceType === "android" && renderAndroidTutorial()}
      {deviceType === "desktop" && renderDesktopMessage()}
    </>
  );
}

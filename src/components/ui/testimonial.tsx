
import { Star } from "lucide-react";
function Testimonial() {
  return <div className="flex flex-col items-center space-y-3 md:space-y-3 space-y-5">
      <div className="flex items-center justify-center">
        {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}
      </div>
      <div className="flex items-center rounded-full border border-border bg-background p-1 shadow shadow-black/5">
        <div className="flex -space-x-1.5">
          <img className="rounded-full ring-1 ring-background" src="https://originui.com/avatar-80-03.jpg" width={20} height={20} alt="Avatar 01" />
          <img className="rounded-full ring-1 ring-background" src="https://originui.com/avatar-80-04.jpg" width={20} height={20} alt="Avatar 02" />
          <img className="rounded-full ring-1 ring-background" src="https://originui.com/avatar-80-05.jpg" width={20} height={20} alt="Avatar 03" />
          <img className="rounded-full ring-1 ring-background" src="https://originui.com/avatar-80-06.jpg" width={20} height={20} alt="Avatar 04" />
        </div>
        <p className="px-2 text-xs text-muted-foreground">
          Created by <strong className="font-medium text-foreground">wellness professionals</strong>
        </p>
      </div>
      <p className="text-sm font-normal md:my-[20px] my-[40px]">"This is by far the quickest and easiest I've ever tracked my nutrition - super cool!" - Jamie P</p>
    </div>;
}
export { Testimonial };

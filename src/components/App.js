import React from "react";
import { Microphone } from "@mynaui/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const App = () => {
  return (
    <div className="w-full max-w-md text-center ">
      <Card>
        <CardHeader>
          <CardTitle>Chat Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            Jokester began sneaking into the castle in the middle of the night
            and leaving jokes all over the place: under the king's pillow, in
            his soup, even in the royal toilet. The king was furious, but he
            couldn't seem to stop Jokester. And then, one day, the people of the
            kingdom discovered that the jokes left by Jokester were so funny
            that they couldn't help but laugh. And once they started laughing,
            they couldn't stop.
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button>
            Click me
            <Microphone />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default App;

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const DevContents = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Tabs defaultValue="uncategorized" defaultChecked>
          <TabsList>
            <TabsTrigger value="uncategorized">Uncategorized</TabsTrigger>
            <TabsTrigger value="categorized">Categorized</TabsTrigger>
          </TabsList>
          <TabsContent value="uncategorized">
            <div>Uncategorized</div>
          </TabsContent>
          <TabsContent value="categorized">
            <div>Categorized</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ); 
};

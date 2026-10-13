import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NeedToKnowModal from "@/components/NeedToKnowModal";
import UsefulInformationModal from "@/components/UsefulInformationModal";
import { useToast } from "@/hooks/use-toast";

interface InformationItem {
  id: string;
  text: string;
  mandatory: boolean;
}

const defaultNeedToKnow: InformationItem[] = [
  {
    id: "1",
    text: "Free OPD",
    mandatory: false,
  },
  {
    id: "2",
    text: "Theraphy Discount",
    mandatory: false,
  },
];

const defaultUsefulInfo: InformationItem[] = [
  {
    id: "1",
    text: "Home Care Service Started Will Be From Next Month",
    mandatory: false,
  },
  {
    id: "2",
    text: "Avail Onsite Services With Discount",
    mandatory: false,
  },
];

export default function ClientPublicInformationHeadings() {
  const { toast } = useToast();
  const [needToKnow, setNeedToKnow] = useState<InformationItem[]>(defaultNeedToKnow);
  const [usefulInfo, setUsefulInfo] = useState<InformationItem[]>(defaultUsefulInfo);
  const [needToKnowModalOpen, setNeedToKnowModalOpen] = useState(false);
  const [usefulInfoModalOpen, setUsefulInfoModalOpen] = useState(false);

  const handleNeedToKnowSave = (data: InformationItem[]) => {
    setNeedToKnow(data);
    setNeedToKnowModalOpen(false);
    toast({
      title: "Success",
      description: "Need to know information updated successfully.",
    });
  };

  const handleUsefulInfoSave = (data: InformationItem[]) => {
    setUsefulInfo(data);
    setUsefulInfoModalOpen(false);
    toast({
      title: "Success",
      description: "Useful information updated successfully.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Public Information Headings</h1>
      </div>

      {/* Need to know Information Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">Need to know Information:</h2>
            <Button
              variant="link"
              className="text-primary p-0 h-auto"
              onClick={() => setNeedToKnowModalOpen(true)}
            >
              Manage
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {needToKnow.length > 0 ? (
              needToKnow.map((item) => (
                <Button
                  key={item.id}
                  variant="default"
                  className="bg-slate-700 hover:bg-slate-800 text-white"
                  disabled
                >
                  {item.text}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No items added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Useful Information Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">Useful Information:</h2>
            <Button
              variant="link"
              className="text-primary p-0 h-auto"
              onClick={() => setUsefulInfoModalOpen(true)}
            >
              Manage
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {usefulInfo.length > 0 ? (
              usefulInfo.map((item) => (
                <Button
                  key={item.id}
                  variant="default"
                  className="bg-slate-700 hover:bg-slate-800 text-white"
                  disabled
                >
                  {item.text}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No items added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Need to know Modal */}
      <NeedToKnowModal
        open={needToKnowModalOpen}
        onOpenChange={setNeedToKnowModalOpen}
        data={needToKnow}
        onSave={handleNeedToKnowSave}
      />

      {/* Useful Information Modal */}
      <UsefulInformationModal
        open={usefulInfoModalOpen}
        onOpenChange={setUsefulInfoModalOpen}
        data={usefulInfo}
        onSave={handleUsefulInfoSave}
      />
    </div>
  );
}


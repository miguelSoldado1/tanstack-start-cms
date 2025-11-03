import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface RecordInfoFormProps {
  data?: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function RecordInfoForm({ data }: RecordInfoFormProps) {
  return (
    <form className="space-y-4">
      <div className="grid gap-2">
        <Label>Id</Label>
        <Input disabled value={data?.id} />
      </div>
      <div className="grid gap-2">
        <Label>Created At</Label>
        <Input disabled value={data?.createdAt ? new Date(data.createdAt).toLocaleString() : ""} />
      </div>
      <div className="grid gap-2">
        <Label>Updated At</Label>
        <Input disabled value={data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : ""} />
      </div>
    </form>
  );
}

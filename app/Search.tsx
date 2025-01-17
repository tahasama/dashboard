"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getProject } from "./action/actions"; // Adjust path to your getProject function
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { error } from "console";
import { AlertCircle, Loader2 } from "lucide-react";

export default function ProjectForm() {
  const [projectNumber, setProjectNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsPending(true);

    // Call the getProject function
    const response = await getProject(projectNumber);

    if (response.project) {
      // Redirect to the project report
      router.push(`/report/${response.project.project_number}`);
    } else {
      // Display error message
      setMessage(response.message || "Unknown error");
    }

    setIsPending(false);
  };

  return (
    <>
      <div className="flex justify-start items-center p-5 mt-2 relative">
        <Label className="min-w-28 text-sm -ml-1 mr-1">
          Find your project:
        </Label>
        <Input
          type="text"
          placeholder={"Enter project number"}
          value={projectNumber}
          onChange={(e) => {
            setProjectNumber(e.target.value);
            setMessage(""); // Reset message when the input changes
          }}
        />

        <Button
          disabled={isPending}
          variant="outline"
          onClick={handleSubmit}
          className="bg-purple-200 outline-1 hover:bg-purple-300 m-1"
        >
          {!isPending ? "Go" : <Loader2 className="animate-spin" />}
        </Button>

        {message && (
          <div className="absolute  -right-1.5 -bottom-6 w-full grid place-content-center">
            <Alert
              variant="destructive"
              className="flex justify-start items-center py-2 px-4"
            >
              <AlertCircle className="h-5 w-5 text-red-500 -mt-2.5 " />
              <AlertDescription className="text-xs ml-2  text-red-600 mt-1">
                {message}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </>
  );
}

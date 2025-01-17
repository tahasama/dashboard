"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getProject } from "./action/actions"; // Adjust path to your getProject function
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { error } from "console";
import { AlertCircle } from "lucide-react";

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
        <Label className="min-w-28 text-sm mx-2">Find your project:</Label>
        <Input
          type="text"
          placeholder={"Enter project number"}
          value={projectNumber}
          onChange={(e) => {
            setProjectNumber(e.target.value), setMessage("");
          }}
        />

        <Button
          disabled={isPending}
          variant="outline"
          onClick={handleSubmit}
          className="bg-purple-200 outline-1 hover:bg-purple-300 m-1"
        >
          Go
        </Button>
        {message && (
          <p className="text-red-500 bg-red-100 w-full rounded p-1.5 absolute right-0 left-5">
            {message}
          </p>
        )}
      </div>
    </>
  );
}

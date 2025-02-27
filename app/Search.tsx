"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronsUpDown, Loader2 } from "lucide-react";

// Define a project interface
interface Project {
  project_number: string;
  project_name: string;
}

interface ProjectFormProps {
  projects: Project[];
}

// Define a project interface
interface Project {
  project_number: string;
  project_name: string;
}

interface ProjectFormProps {
  projects: Project[];
}

export default function ProjectForm({ projects }: ProjectFormProps) {
  // Holds the selected project's display string, e.g. "P001 - Project Name"
  const [selectedProject, setSelectedProject] = useState<string>("");
  // Holds the query for filtering the projects list
  const [query, setQuery] = useState<string>("");
  // Controls whether the dropdown is open
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  // For submission state and error messages
  const [isPending, setIsPending] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  // useEffect(() => {
  //   handleSubmit();
  // }, [selectedProject]);

  // Filter projects based on the query input
  const filteredProjects =
    query === ""
      ? projects
      : projects.filter((proj) =>
          `${proj.project_number} - ${proj.project_name}`
            .toLowerCase()
            .includes(query.toLowerCase())
        );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return; // safeguard
    setIsPending(true);
    // Extract project number from selectedProject
    const projectNumber = selectedProject.split(" - ")[0];
    router.push(`/report/${projectNumber}`);
    setIsPending(false);
  };

  return (
    <form className="flex flex-col sm:flex-row justify-start items-center p-5 mt-2 relative">
      <Label className="min-w-28 text-sm -ml-2.5 mr-1 mb-2">
        Find your project:
      </Label>

      <div className="relative">
        <div className="flex items-center border p-2 w-fit rounded-md">
          <input
            type="text"
            placeholder="Search project..."
            value={query || selectedProject}
            onChange={(e) => {
              setQuery(e.target.value);
              setMessage(""); // Clear any error message
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="flex-1 outline-none text-sm max-w-44"
          />
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="ml-1"
          >
            <ChevronsUpDown className="w-4 h-4 opacity-50" />
          </button>
        </div>

        {isDropdownOpen && (
          <div
            className="absolute mt-1 w-auto text-sm bg-white whitespace-nowrap text-ellipsis border rounded-md shadow-lg max-h-60 overflow-auto z-10"
            // className="absolute z-20 p-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap overflow-hiden text-ellipsis"
          >
            {filteredProjects.length > 0 ? (
              filteredProjects.map((proj) => {
                const displayValue = `${proj.project_number} - ${proj.project_name}`;
                return (
                  <div
                    key={proj.project_number}
                    onClick={() => {
                      setSelectedProject(displayValue);
                      setIsDropdownOpen(false);
                      setQuery(""); // reset query if needed
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {displayValue}
                  </div>
                );
              })
            ) : (
              <Alert variant="destructive" className="gap-0  w-auto">
                <AlertCircle className="h-5 w-5 text-red-500 -mt-1.5" />
                <AlertDescription className="text-xs text-red-600 mt-1">
                  Name/No of project not found.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      <Button
        disabled={isPending || !selectedProject}
        variant="outline"
        onClick={handleSubmit}
        className="bg-purple-200 outline-1 hover:bg-purple-300 lg:m-1 w-full mt-2"
      >
        {!isPending ? "Go" : <Loader2 className="animate-spin" />}
      </Button>
    </form>
  );
}

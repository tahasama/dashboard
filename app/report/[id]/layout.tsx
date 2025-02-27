import RotationMessage from "@/app/RotationMessage";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="hidden sm:block">{children}</div>
      <div className="sm:hidden flex w-full justify-center items-center">
        <RotationMessage />
      </div>
    </>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/auth/login";
      } else {
        console.error("Failed to logout");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline" disabled={isLoading} className="ml-auto">
      {isLoading ? "Wylogowywanie..." : "Wyloguj"}
    </Button>
  );
}


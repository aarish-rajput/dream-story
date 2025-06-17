"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/context/auth";
import { Loader2Icon, Eye, EyeOff } from "lucide-react";
import React, { ChangeEvent, useState } from "react";

export default function LoginPage() {
  const { user, setUser, handleLoginSubmit, loading } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex justify-center items-center h-screen -mt-16 mx-6">
      <Card className="w-full max-w-md p-4 border-purple-500">
        <CardHeader>
          <CardTitle className="text-2xl text-red-800">Login</CardTitle>
          <CardDescription>Enter your email address to login</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              value={user?.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="col-span-3 border-purple-500"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={user?.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="col-span-3 border-purple-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-700"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              disabled={loading}
              type="submit"
              className="bg-red-800 text-white hover:bg-red-500"
            >
              {loading ? <Loader2Icon className="animate-spin" /> : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

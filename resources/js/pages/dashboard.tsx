"use client"

import { useState } from "react"
import { Users, Mail, Send, Home, FileText, UserX, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UsersScreen from "@/components/users-screen"
import TemplatesScreen from "@/components/templates-screen"
import CampaignScreen from "@/components/campaign-screen"
import BatchesScreen from "@/components/batches-screen"
import SendToBatchScreen from "@/components/send-to-batch-screen"

export default function EmailAutomationDashboard() {
  const [activeScreen, setActiveScreen] = useState("batches")

  const renderScreen = () => {
    switch (activeScreen) {
      case "users":
        return <UsersScreen />
      case "templates":
        return <TemplatesScreen />
      case "campaigns":
        return <CampaignScreen />
      case "batches":
        return <BatchesScreen />
      case "send-to-batch":
        return <SendToBatchScreen />
      default:
        return <BatchesScreen />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-cyan-500 text-white flex flex-col">
        <div className="p-4 border-b border-cyan-400">
          <div className="flex items-center gap-2 mb-4">
            <Home className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Email Automation</h1>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-cyan-200">john.doe@example.com</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Button
                variant={activeScreen === "batches" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeScreen === "batches"
                    ? "bg-white text-cyan-500 hover:bg-gray-100"
                    : "text-white hover:bg-cyan-400"
                }`}
                onClick={() => setActiveScreen("batches")}
              >
                <Package className="mr-2 h-4 w-4" />
                User Batches
              </Button>
            </li>
            <li>
              <Button
                variant={activeScreen === "users" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeScreen === "users" ? "bg-white text-cyan-500 hover:bg-gray-100" : "text-white hover:bg-cyan-400"
                }`}
                onClick={() => setActiveScreen("users")}
              >
                <Users className="mr-2 h-4 w-4" />
                All Users
              </Button>
            </li>
            <li>
              <Button
                variant={activeScreen === "templates" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeScreen === "templates"
                    ? "bg-white text-cyan-500 hover:bg-gray-100"
                    : "text-white hover:bg-cyan-400"
                }`}
                onClick={() => setActiveScreen("templates")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Email Templates
              </Button>
            </li>
            <li>
              <Button
                variant={activeScreen === "send-to-batch" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeScreen === "send-to-batch"
                    ? "bg-white text-cyan-500 hover:bg-gray-100"
                    : "text-white hover:bg-cyan-400"
                }`}
                onClick={() => setActiveScreen("send-to-batch")}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Mail to Batch
              </Button>
            </li>
            <li>
              <Button
                variant={activeScreen === "campaigns" ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeScreen === "campaigns"
                    ? "bg-white text-cyan-500 hover:bg-gray-100"
                    : "text-white hover:bg-cyan-400"
                }`}
                onClick={() => setActiveScreen("campaigns")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Campaign History
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-cyan-400">
                <Mail className="mr-2 h-4 w-4" />
                Welcome Email
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-cyan-400">
                <Mail className="mr-2 h-4 w-4" />
                Follow Up Email
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-cyan-400">
                <UserX className="mr-2 h-4 w-4" />
                Unsubscribe
              </Button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">{renderScreen()}</div>
    </div>
  )
}

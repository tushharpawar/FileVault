"use client"

import { Button } from '@/components/ui/button'
import { 
  showUploadToasts, 
  showFileActionToasts, 
  showAuthToasts 
} from '@/lib/toast-utils'

export function ToastTester() {
  const testToasts = [
    {
      label: "Upload Success",
      action: () => showUploadToasts.uploadSuccess(3)
    },
    {
      label: "File Too Large",
      action: () => showUploadToasts.fileTooLarge("example.zip", "50MB")
    },
    {
      label: "Unsupported Format",
      action: () => showUploadToasts.unsupportedFormat("file.xyz")
    },
    {
      label: "Upload Failed",
      action: () => showUploadToasts.uploadFailed("document.pdf", "Network error")
    },
    {
      label: "Storage Not Ready",
      action: () => showUploadToasts.storageNotReady()
    },
    {
      label: "Link Copied",
      action: () => showFileActionToasts.linkCopied("presentation.pptx")
    },
    {
      label: "Share Success",
      action: () => showFileActionToasts.shareSuccess("document.pdf")
    },
    {
      label: "Share Failed",
      action: () => showFileActionToasts.shareFailed()
    },
    {
      label: "Delete Success",
      action: () => showFileActionToasts.deleteSuccess("old-file.txt")
    },
    {
      label: "Delete Failed",
      action: () => showFileActionToasts.deleteFailed("protected-file.txt")
    },
    {
      label: "Login Success",
      action: () => showAuthToasts.loginSuccess("admin")
    },
    {
      label: "Login Failed",
      action: () => showAuthToasts.loginFailed("Invalid credentials")
    },
    {
      label: "Incorrect Password",
      action: () => showAuthToasts.incorrectPassword()
    },
    {
      label: "Username Not Found",
      action: () => showAuthToasts.incorrectUsername()
    },
    {
      label: "Session Expired",
      action: () => showAuthToasts.sessionExpired()
    },
    {
      label: "Logout Success",
      action: () => showAuthToasts.logoutSuccess()
    }
  ]

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Toast Tester</h2>
      <p className="text-gray-600">Click any button to test different toast notifications:</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {testToasts.map((test, index) => (
          <Button 
            key={index}
            onClick={test.action}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {test.label}
          </Button>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900">Essential Toast Features:</h3>
        <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
          <li>✅ File upload, sharing, and deletion notifications</li>
          <li>✅ Authentication feedback (login, logout, errors)</li>
          <li>✅ Professional error handling with clear messaging</li>
          <li>✅ Multiple toasts can be shown simultaneously (up to 3)</li>
          <li>✅ Auto-dismiss after appropriate duration</li>
          <li>✅ Rich content with clean, modern design</li>
        </ul>
      </div>
    </div>
  )
}

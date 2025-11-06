import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/authService"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

const Login = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await authService.login(formData.email, formData.password)
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      })
      
      navigate("/")
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center" style={{fontFamily: "'Inter', sans-serif"}}>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" style={{fontFamily: "'Satoshi Variable', sans-serif"}}>Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0C3E3F] hover:bg-[#0C3E3F]/90"
                disabled={isLoading}
                style={{fontFamily: "'Satoshi Variable', sans-serif"}}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm" style={{fontFamily: "'Inter', sans-serif"}}>
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#0C3E3F] hover:underline font-semibold">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  )
}

export default Login

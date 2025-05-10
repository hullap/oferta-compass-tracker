
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

type AuthMode = "login" | "signup" | "reset";

const Auth = () => {
  // Define the mode type to explicitly include "reset"
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { user, signIn, signUp, resetPassword } = useAuth();
  
  // Redirect to home if user is already logged in
  if (user) {
    return <Navigate to="/" />;
  }
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, informe seu e-mail");
      return;
    }
    
    try {
      setLoading(true);
      
      if (mode === "login") {
        if (!password) {
          toast.error("Por favor, informe sua senha");
          return;
        }
        await signIn(email, password);
        toast.success("Login realizado com sucesso!");
      } 
      else if (mode === "signup") {
        if (!password) {
          toast.error("Por favor, informe sua senha");
          return;
        }
        await signUp(email, password);
        toast.success("Conta criada com sucesso! Verifique seu e-mail.");
      } 
      else if (mode === "reset") {
        await resetPassword(email);
        toast.success("E-mail de recuperação enviado!");
        setMode("login");
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-900/50 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
            {mode === "login" && "Entrar na sua conta"}
            {mode === "signup" && "Criar uma nova conta"}
            {mode === "reset" && "Recuperar sua senha"}
          </CardTitle>
          <CardDescription>
            {mode === "login" && "Entre com seu e-mail e senha para acessar"}
            {mode === "signup" && "Preencha os dados abaixo para criar sua conta"}
            {mode === "reset" && "Informe seu e-mail para recuperar sua senha"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700" 
              />
            </div>
            
            {mode !== "reset" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {mode === "login" && (
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm" 
                      className="px-0 text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => setMode("reset")}
                    >
                      Esqueceu a senha?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700" 
                  />
                  <Button 
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={loading}
            >
              {loading ? "Carregando..." : (
                mode === "login" ? "Entrar" : 
                mode === "signup" ? "Criar conta" : 
                "Enviar e-mail de recuperação"
              )}
            </Button>
            
            <div className="text-center text-sm">
              {mode === "login" ? (
                <>
                  Não tem uma conta?{" "}
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-blue-400 hover:text-blue-300 p-0"
                    onClick={() => setMode("signup")}
                  >
                    Criar agora
                  </Button>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-blue-400 hover:text-blue-300 p-0"
                    onClick={() => setMode("login")}
                  >
                    Entrar
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;

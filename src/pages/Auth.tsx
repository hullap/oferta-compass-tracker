
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChartLine, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

const Auth = () => {
  // Define the mode type to explicitly include "reset"
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated, signIn, signUp, resetPassword } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else if (mode === "signup") {
        await signUp(email, password);
        toast.success("Conta criada com sucesso! Verifique seu email.");
      } else if (mode === "reset") {
        await resetPassword(email);
        toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        setMode("login");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-gradient-radial from-blue-500/20 to-transparent opacity-50 blur-3xl"></div>
      </div>
      
      <div className="text-center mb-8 animate-fade-in">
        <div className="bg-gradient-to-r from-theme-blue to-theme-purple p-3 rounded-xl inline-flex mb-6 shadow-glow">
          <ChartLine className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-gradient">Ad Tracker Pro</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {mode === "login" ? "Acesse sua conta para monitorar e otimizar suas ofertas" : 
           mode === "signup" ? "Crie uma conta e comece a monitorar suas ofertas" :
           "Recupere o acesso à sua conta"}
        </p>
      </div>
      
      <Card className="w-full max-w-md border border-gray-800 card-gradient animate-fade-in shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-gradient">
              {mode === "login" ? "Entrar" : 
               mode === "signup" ? "Criar conta" : 
               "Recuperar senha"}
            </CardTitle>
            <CardDescription>
              {mode === "login" ? "Entre com seu e-mail e senha" : 
               mode === "signup" ? "Preencha os dados para criar sua conta" : 
               "Informe seu e-mail para receber instruções"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} />
                E-mail
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="border-gray-700 input-enhanced"
              />
            </div>
            
            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock size={16} />
                  Senha
                </Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required={mode !== "reset"}
                  className="border-gray-700 input-enhanced"
                />
              </div>
            )}
            
            {mode === "login" && (
              <div className="text-right">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="p-0 text-sm text-muted-foreground hover:text-white"
                  onClick={() => setMode("reset")}
                >
                  Esqueceu sua senha?
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full btn-gradient" 
              disabled={loading}
            >
              {loading ? "Processando..." : 
               mode === "login" ? "Entrar" : 
               mode === "signup" ? "Criar conta" : 
               "Enviar e-mail de recuperação"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="w-full flex justify-between">
              {mode !== "login" && (
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setMode("login")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para login
                </Button>
              )}
              
              {mode !== "signup" && mode !== "reset" && (
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setMode("signup")}
                >
                  Criar nova conta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;

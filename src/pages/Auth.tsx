
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChartLine } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated, signIn, signUp } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        toast.success("Conta criada com sucesso! Verifique seu email.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-theme-blue to-theme-purple p-2 rounded-md inline-flex mb-4">
          <ChartLine className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Oferta Compass</h1>
        <p className="text-muted-foreground">Monitore e analise o desempenho de suas ofertas</p>
      </div>
      
      <Card className="w-full max-w-md border border-gray-800 card-gradient">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isLogin ? "Entrar" : "Criar conta"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Entre na sua conta para acessar suas ofertas" 
                : "Crie uma conta para começar a monitorar suas ofertas"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-gray-700"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Processando..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin 
                ? "Não tem uma conta? Criar agora" 
                : "Já tem uma conta? Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;

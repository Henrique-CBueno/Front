import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/Sidebar";
import { Users, Coins, FileText, CheckCircle, XCircle } from "lucide-react";

type User = {
  id: string;
  email: string;
  tokens: number;
  pdfsUploaded: number;
  is_verified: boolean;
};

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newTokens, setNewTokens] = useState<number>(0);
  const [search, setSearch] = useState("");

  const filteredUsers = search.length > 0 
   ? users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()))
   : users;


  useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        try {
        const res = await fetch("http://localhost:8000/admin/getUsers", {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });


        if (!res.ok) {
            throw new Error("Erro ao buscar usuários");
        }

        const data = await res.json();
        setUsers(data.users);
        console.log(data.users);
        } catch (e) {
        console.error(e);
        } finally {
        setLoading(false);
        }
    };

    fetchUsers();
    }, []);


  const handleUpdateTokens = async (id: string) => {
    try {
    const res = await fetch(`http://localhost:8000/admin/users/${id}/tokens`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ tokens: newTokens }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Erro ao atualizar tokens");
    }

    const updatedUser = await res.json();

    // Atualiza o estado no React para refletir a mudança
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    setEditingUser(null);
    setNewTokens(0);
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Erro inesperado");
  }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, tokens: newTokens } : u
      )
    );
    setEditingUser(null);
    setNewTokens(0);
  };

  if (!user || !user.role || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background pt-8 lg:pt-0">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Administração</h1>
            <Badge variant="outline" className="gap-2">
              <Users className="h-4 w-4" /> {users.length} usuários
            </Badge>
          </div>
          <div className="w-full flex justify-center items-center pb-6">
            <Input type="text" placeholder="Buscar usuário..." className="w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
          {loading ? (
            <p>Carregando usuários...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredUsers.map((u) => (
                <Card key={u.id}>
                  <CardHeader>
                    <CardTitle>{u.email}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">{u.tokens} tokens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">{u.pdfsUploaded} PDFs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.is_verified ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">Verificado</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-600">Não Verificado</span>
                        </>
                      )}
                    </div>

                    {/* Editar tokens */}
                    {editingUser === u.id ? (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Qtd tokens"
                          value={newTokens}
                          onChange={(e) => setNewTokens(Number(e.target.value))}
                        />
                        <Button onClick={() => handleUpdateTokens(u.id)}>Salvar</Button>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setEditingUser(u.id)}
                      >
                        Alterar tokens
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;

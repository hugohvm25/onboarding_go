Criação do projeto Onboarding em GO.

configuração do ambiente.

- instalação do go;
- configuração do path no sistema em Sistema>Configurações Avançadas de Sistema>Variáveis de Ambiente e Alterar o caminho da pasta do GOPATH.
- para utilizar outras pastas dentro do projeto, deve ser criado o mod  no terminal com o comando  - go mod init "nome do projeto" -  que terá o nome do projeto e a versão do Go.
    - para utilizar o nome da pasta, deverá utilizar o "nome do projeto"/"nome da pasta" 

Para esse projeto faremos a conexão diretamente com o banco de dados loca MySQL instalando a dependencia:
go get github.com/go-sql-driver/mysql

e importando a biblioteca mysql
"database/sql"
_ "github.com/go-sql-driver/mysql"

Caso apareça o erro "github.com/go-sql-driver/mysql should be direct go mod tidy", executar o comando  - go mod tidy - para que seja corrigido
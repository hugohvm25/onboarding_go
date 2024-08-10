package models

import "onboarding_go/db"

// criando uma estrutura para que sejam armazenados novos produtos de forma automatizada sem ter que ficar criando tabelas dentro do arquivo HTML individualmente
type Produto struct {
	Id         int
	Nome       string
	Descricao  string
	Preco      float64
	Quantidade int
}

func BuscaTodosProdutos() []Produto {
	db := db.ConectaComBancoDeDados()
	selecProdutos, err := db.Query("select * from produtos")
	if err != nil {
		panic(err.Error())
	}

	//instanciando 1 produto depois armazenar no slice para exibir na página com um laço de repetição FOR
	p := Produto{}
	produtos := []Produto{}

	for selecProdutos.Next() {
		var id, quantidade int
		var nome, descricao string
		var preco float64

		//vai scanear cada linha e armazenar as informações de cada produto no endereço &
		err = selecProdutos.Scan(&id, &nome, &descricao, &preco, &quantidade)
		if err != nil {
			panic(err.Error())
		}

		//após o scaneamento vai inserir na variavel p cada dado para ser incluido no slice
		p.Id = id
		p.Nome = nome
		p.Descricao = descricao
		p.Preco = preco
		p.Quantidade = quantidade

		//adicionar a listas de produtos um a um
		produtos = append(produtos, p)
	}

	//obrigatoriamente fecha o banco de dados
	defer db.Close()
	return produtos

}

// a função recebe alguns parametros que foram mencionados no controler para adicionar novos produtos
func CriarNovoProduto(nome, descricao string, preco float64, quantidde int) {
	db := db.ConectaComBancoDeDados()

	//comando de inclusão no banco passando o comando de insert e fazendo a verificação dos valores de acordo com o tipo de dados aceito no banco
	insereDadosNoBanco, err := db.Prepare("insert into produtos(nome, descricao, preco, quantidade) values ($1, $2, $3, $4)")
	if err != nil {
		panic(err.Error())
	}
	//se não tiver algum erro, execute a inserção no banco
	insereDadosNoBanco.Exec(nome, descricao, preco, quantidde)
	defer db.Close()
}

// recebe o parametro porém não faz diferença apesar de ser int pois será deletado
func DeletaProduto(id string) {
	db := db.ConectaComBancoDeDados()

	//prepara o banco de dados para executar a função desejada de deletar o produto e a condição pelo ID do produto
	deletarOProduto, err := db.Prepare("delete from produtos where id=$1")
	if err != nil {
		panic(err.Error())
	}
	//executa a ação caso não tenha erro
	deletarOProduto.Exec(id)
	defer db.Close()
}

func EditaProduto(id string) Produto {
	db := db.ConectaComBancoDeDados()
	//pedir para o banco buscar as informações do produto onde o ID seja exatamente igual o ID selecionado
	produtoDoBanco, err := db.Query("select * from produtos where id=$1", id)
	if err != nil {
		panic(err.Error())
	}

	//instanciar o produto com o produto para atualizar
	produtoParaAtualizar := Produto{}

	for produtoDoBanco.Next() {
		var id, quantidade int
		var nome, descricao string
		var preco float64

		//verificação se o Id do banco seja igual ao endereço exato do id selecionado com &
		err = produtoDoBanco.Scan(&id, &nome, &descricao, &preco, &quantidade)
		if err != nil {
			panic(err.Error())
		}

		produtoParaAtualizar.Id = id
		produtoParaAtualizar.Nome = nome
		produtoParaAtualizar.Descricao = descricao
		produtoParaAtualizar.Preco = preco
		produtoParaAtualizar.Quantidade = quantidade
	}
	defer db.Close()
	return produtoParaAtualizar
}

// passar os parametros sempre na mesma ordem
func AtualizarProduto(id int, nome, descricao string, preco float64, quantidade int) {
	db := db.ConectaComBancoDeDados()

	AtualizaProduto, err := db.Prepare("update produtos set nome=$1, descricao=$2, preco=$3, quantidade=$4 where id=$5")
	if err != nil {
		panic(err.Error())
	}
	AtualizaProduto.Exec(nome, descricao, preco, quantidade, id)
	defer db.Close()
}

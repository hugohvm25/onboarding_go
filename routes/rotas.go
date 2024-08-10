package routes

import (
	"net/http"
	"onboarding_go/controlers"
)

func CarregarRotas() {
	//sempre que tiver um / ela vai respoder para um segundo parametro - NÃO ESQUECER DO : PARA DETERMINAR A ROTA HTML
	http.HandleFunc("/", controlers.Index)
	// //adicionando a rota para abrir a nova página ao clicar no botão de adicionar produtos passando o caminho do botão /new e o controler
	// http.HandleFunc("/new", controlers.New)
	// //criar rota da inserção de dados no banco
	// http.HandleFunc("/insert", controlers.Insert)
	// //criar rota para deletar o dado
	// http.HandleFunc("/delete", controlers.Delete)
	// http.HandleFunc("/edit", controlers.Edit)
	// http.HandleFunc("/update", controlers.Update)
}

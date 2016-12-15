import React, {Component} from 'react';
import CustomInput from './componentes/CustomInput';
import SubmitButton from './componentes/SubmitButton';
import PubSub from 'pubsub-js';
import $ from 'jquery';
import TratadorErros from './TratadorErros';

export class FormularioAutor extends Component {

    constructor() {
        super();
        this.state = {
            nome: '',
            email: '',
            senha: ''
        };
        this.enviaForm = this.enviaForm.bind(this);
        this.salvarAlteracao = this.salvarAlteracao.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({nome: this.state.nome, email: this.state.email, senha: this.state.senha}),
            success: function(novaListagem) {
                PubSub.publish('atualiza-lista-autores', novaListagem);
                this.setState({nome: '', email: '', senha: ''});
            }.bind(this),
            error: function(resposta) {
                if (resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON.errors);
                }
            },
            beforeSend: function() {
                PubSub.publish('limpa-validacao', {});
            }
        });
    }

    salvarAlteracao(nomeInput, evento) {
        let campoSendoAlterado = {};
        campoSendoAlterado[nomeInput] = evento.target.value;
        this.setState(campoSendoAlterado);
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <CustomInput label="Nome" id="nome" type="text" name="nome" value={this.state.nome} onChange={this.salvarAlteracao.bind(this,'nome')}/>
                    <CustomInput label="E-mail" id="email" type="text" name="email" value={this.state.email} onChange={this.salvarAlteracao.bind(this,'email')}/>
                    <CustomInput label="Senha" id="senha" type="text" name="senha" value={this.state.senha} onChange={this.salvarAlteracao.bind(this,'senha')}/>
                    <SubmitButton label="Gravar"/>
                </form>
            </div>
        );
    }
}

export class TabelaAutores extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.lista.map(autor => {
                            return (
                                <tr key={autor.id}>
                                    <td>{autor.nome}</td>
                                    <td>{autor.email}</td>
                                </tr>
                            );
                        })
}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class AutorBox extends Component {

    constructor() {
        super();
        this.state = {
            lista: []
        };
        this.atualizaListagem = this.atualizaListagem.bind(this);
    }

    componentDidMount() {
        fetch('http://localhost:8080/api/autores').then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res;
        }).then(res => res.json()).then(result => this.setState({lista: result}));

        PubSub.subscribe('atualiza-lista-autores', (topico, novaLista) => this.setState({lista: novaLista}));
    }

    atualizaListagem(novaLista) {
        this.setState({lista: novaLista});
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Autores</h1>
                </div>
                <div>
                    <FormularioAutor/>
                    <TabelaAutores lista={this.state.lista}/>
                </div>
            </div>
        );
    }
}

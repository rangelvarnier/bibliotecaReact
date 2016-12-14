import React, {Component} from 'react';
import PubSub from 'pubsub-js';
import $ from 'jquery';
import CustomInput from './componentes/CustomInput';
import SubmitButton from './componentes/SubmitButton';
import TratadorErros from './TratadorErros';

export class FormularioLivro extends Component {
    constructor() {
        super();

        this.state = {
            titulo: '',
            preco: '',
            autorId: ''
        }

        this.enviaForm = this.enviaForm.bind(this);
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setAutorId = this.setAutorId.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId}),
            success: function(novaListagem) {
                PubSub.publish('atualiza-lista-livros', novaListagem);
                this.setState({titulo: '', preco: '', autorId: ''});
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

    setTitulo(evento) {
        this.setState({titulo: evento.target.value});
    }

    setPreco(evento) {
        this.setState({preco: evento.target.value});
    }

    setAutorId(evento) {
        this.setState({autorId: evento.target.value});
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <CustomInput label="Título" id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo}/>
                    <CustomInput label="Preço" id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco}/>

                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor</label>
                        <select name="autorId" id="autorID" onChange={this.setAutorId}>
                            <option value="">Selecione autor</option>
                            {
                              this.props.autores.map(autor =>
                                <option value={autor.id} key={autor.id}>{autor.nome}</option>)
                            }
                        </select>
                    </div>
                    <SubmitButton label="Gravar"/>
                </form>
            </div>
        );
    }
}

export default class LivroBox extends Component {

    constructor() {
        super();
        this.state = {
            lista: [],
            autores: []
        };
    }

    componentDidMount() {
        fetch('http://localhost:8080/api/livros').then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res;
        }).then(res => res.json()).then(result => this.setState({lista: result}));

        fetch('http://localhost:8080/api/autores').then(res => {
            if (!res.ok)
                throw new Error(res.statusText);
            return res;
        }).then(res => res.json()).then(result => this.setState({autores: result}));

        PubSub.subscribe('atualiza-lista-livros', (topico, novaLista) => this.setState({lista: novaLista}));
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livro</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores}/>
                    <TabelaLivros lista={this.state.lista}/>
                </div>
            </div>
        );
    }
}

export class TabelaLivros extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>Preço</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.lista.map(livro => {
                            return (
                                <tr key={livro.id}>
                                    <td>{livro.titulo}</td>
                                    <td>{livro.autor.nome}</td>
                                    <td>{livro.preco}</td>
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

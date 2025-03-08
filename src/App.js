import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Referência para o elemento de áudio
  const audioRef = useRef(null);

  // Função para lidar com a mudança no input
  const handleInputChange = (event) => {
    setPokemonName(event.target.value);
  };

  // Função para fazer a requisição à API
  const fetchPokemonData = async (pokemon) => {
    setLoading(true);
    setError(null);  // Reseta o erro antes de nova requisição

    try {
      const response = await fetch(`http://localhost:8000/?pokemon_name=${pokemon}`);

      if (!response.ok) {
        const errorResponse = await response.json();
        setError(errorResponse.msg);  // Exibe a mensagem de erro retornada pela API
        setPokemonData(null); // Limpa os dados do Pokémon
        return;
      }

      const data = await response.json();
      setPokemonData(data);  // Define os dados do Pokémon

      // Parar o áudio anterior
      if (audioRef.current) {
        audioRef.current.pause(); // Para o áudio atual
        audioRef.current.currentTime = 0; // Reseta o tempo do áudio para o começo
      }

      // Forçar o navegador a recarregar a nova URL do áudio
      if (audioRef.current && data.cries) {
        audioRef.current.src = data.cries;  // Atualiza a fonte de áudio
        audioRef.current.load(); // Recarrega o áudio
      }

    } catch (err) {
      setError('Erro ao acessar a API');
      setPokemonData(null); // Limpa os dados em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar o nome do Pokémon e recarregar a página com a URL atualizada
  const handleSubmit = (event) => {
    event.preventDefault();
    if (pokemonName.trim()) {
      // Atualiza a URL para incluir o nome do Pokémon
      window.history.pushState({}, '', `/?pokemon_name=${pokemonName}`);
      fetchPokemonData(pokemonName); // Faz a requisição à API
    }
  };

  // Efeito que será executado ao carregar a página para buscar o Pokémon na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameFromUrl = urlParams.get('pokemon_name');
    if (nameFromUrl) {
      setPokemonName(nameFromUrl);
      fetchPokemonData(nameFromUrl);
    }
  }, []);

  return (
    <div className="App">
      <h1>Pokedex da Ingridolas</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={pokemonName}
          onChange={handleInputChange}
          placeholder="Digite o nome do Pokémon"
        />
        <button type="submit">Buscar</button>
      </form>

      {loading && <p>Carregando...</p>}

      {/* Se houver erro, exibe a mensagem de erro */}
      {error && <p className="error-message">{error}</p>}

      {/* Verifica se pokemonData existe antes de tentar acessar as propriedades */}
      {pokemonData && !error && (
        <div className="pokemon-info">
          <h2>{pokemonData.name ? pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1) : ''}</h2>

          {/* Imagens do Pokémon (rolagem horizontal) */}
          {pokemonData.sprites && pokemonData.sprites.length > 0 && (
            <div className="image-gallery">
              {pokemonData.sprites.map((sprite, index) => (
                <img key={index} src={sprite} alt={`${pokemonData.name} sprite ${index + 1}`} className="sprite-image" />
              ))}
            </div>
          )}

          {/* Informações gerais */}
          <div className="info-table">
            <p><strong>Altura:</strong> {pokemonData.height ? pokemonData.height : 'Desconhecida'} decímetros</p>
            <p><strong>Peso:</strong> {pokemonData.weight ? pokemonData.weight : 'Desconhecido'} hectogramas</p>
            <p><strong>Tipo(s):</strong> {pokemonData.types ? pokemonData.types.join(', ') : 'Desconhecido'}</p>
            <p><strong>Habilidade(s):</strong> {pokemonData.abilities ? pokemonData.abilities.join(', ') : 'Desconhecido'}</p>
          </div>

          {/* Estatísticas */}
          <div className="stats-table">
            <h3>Estatísticas:</h3>
            <ul>
              <li><strong>Ataque:</strong> {pokemonData.stats ? pokemonData.stats.attack : 'Desconhecido'}</li>
              <li><strong>Defesa:</strong> {pokemonData.stats ? pokemonData.stats.defense : 'Desconhecido'}</li>
              <li><strong>HP:</strong> {pokemonData.stats ? pokemonData.stats.hp : 'Desconhecido'}</li>
              <li><strong>Ataque Especial:</strong> {pokemonData.stats ? pokemonData.stats['special-attack'] : 'Desconhecido'}</li>
              <li><strong>Defesa Especial:</strong> {pokemonData.stats ? pokemonData.stats['special-defense'] : 'Desconhecido'}</li>
              <li><strong>Velocidade:</strong> {pokemonData.stats ? pokemonData.stats.speed : 'Desconhecido'}</li>
            </ul>
          </div>

          {/* Áudio do grito */}
          <div className="audio-container">
            <label className="audio-label">Áudio do Pokémon (Noise)</label>
            <audio ref={audioRef} controls className="audio-player">
              {pokemonData.cries && <source src={pokemonData.cries} type="audio/ogg" />}
              Seu navegador não suporta o áudio.
            </audio>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <p>Feito com amor por Lucas Canelinha</p>
      </footer>
    </div>
  );
}

export default App;

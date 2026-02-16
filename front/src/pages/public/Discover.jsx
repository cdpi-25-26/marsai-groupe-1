import React from 'react';

export default function Discover() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Découvrir</h1>
            <p>Bienvenue sur la page de découverte.</p>
            <button onClick={() => alert('Bouton cliqué!')}>
                Cliquer ici
            </button>
        </div>
    );
}
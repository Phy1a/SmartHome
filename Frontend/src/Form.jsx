import { useState } from 'react'
//import './App.css'


export default function Form(props) {

  // 1. STATE
  // "name" contient la valeur du champ input
  // "setName" permet de modifier cette valeur
  const [name, setName] = useState('');

  // 2. GESTION DU CHANGEMENT (input contrôlé)
  // Cette fonction est appelée à chaque frappe dans l'input
  const handleChange = (event) => {
    // event.target.value = valeur actuelle du champ
    setName(event.target.value);
  };

  // 3. SOUMISSION DU FORMULAIRE
  const handleSubmit = (event) => {
    // Empêche le rechargement de la page (comportement HTML par défaut)
    event.preventDefault();

    // Traitement des données
    alert('Nom soumis : ' + name);

    // OPTION : envoyer la donnée au parent (App)
    if (props.onSubmitName) {
      props.onSubmitName(name);
    }

    // Réinitialiser le champ après envoi
    setName('');
  };

  // 4. RENDER (ce que React affiche)
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nom :
        {/* 
          input contrôlé :
          - value = state React
          - onChange = mise à jour du state
        */}
        <input 
          type="text" 
          value={name} 
          onChange={handleChange} 
        />
      </label>

      <input type="submit" value="Envoyer" />
    </form>
  );
}


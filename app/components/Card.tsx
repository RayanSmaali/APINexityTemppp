
/*----------------------------------------------------------------
  function formatDate(dateString) : 
    - dateString : Chaîne de caractère indiquant la date et l'heure de création d'un ticket telle qu'elle est reçue par l'API.
    - (return) Intl.DateTimeFormat : sortie formatée pour affichage.

    Fonction qui formate la date et l'heure de création d'un ticket pour un affichage lisible.
  ----------------------------------------------------------------*/
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long', // "lundi"
        day: '2-digit',  // "17"
        month: 'long',   // "janvier"
        year: 'numeric', // "2025"
        hour: '2-digit', // "19"
        minute: '2-digit', // "02"
        second: '2-digit', // "38"
        timeZoneName: 'short' // "GMT+1"
    }).format(date);  
};

function base64ToBlob(base64, mimeType) {
    mimeType = mimeType.replaceAll("image/image", "image")
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length).fill(0).map((_, i) => byteChars.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

/*----------------------------------------------------------------
  function renderComment(commentArray) : 
    - commentArray : tableau contenant les valeurs des commentaires.
    - (return) result : HTML formaté pour affichage.

    Fonction qui affiche les commentaires sous forme d'une liste HTML.
  ----------------------------------------------------------------*/
function renderComment(commentArray) {
    if (!commentArray || commentArray.length === 0) return null;

    const result = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Regex pour détecter les URLs



    for (let i = 0; i < commentArray.length; i += 2) {
        let value = commentArray[i + 1] || "N/A";
        const base64ImageTagRegex = /<img[^>]*src="data:(image\/[^;]+);base64,([^"]+)"[^>]*>/gi;



        const jsxParts = [];
        let lastIndex = 0;
        let match;
        let hasBase64Image = false;

        while((match = base64ImageTagRegex.exec(value)) !== null) 
        {
            const [fullMatch, mimeType, base64Data] = match;
            const start = match.index;
            hasBase64Image = true;

            // Texte avant l'image
            if (start > lastIndex) {
                jsxParts.push(value.substring(lastIndex, start));
            }

            // Lien vers l'image
            const blob = base64ToBlob(base64Data, mimeType);
            const imageUrl = URL.createObjectURL(blob);

            jsxParts.push(
                <a
                    key={imageUrl}
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", margin: "5px 0" }}
                >
                    Voir l’image
                </a>
            );

            lastIndex = start + fullMatch.length;
        }

        if(hasBase64Image)
        {
            // Reste du texte après la dernière balise <img>
            if (lastIndex < value.length) {
                jsxParts.push(value.substring(lastIndex));
            }

            value = jsxParts;
        }

        

        
        // Si la valeur contient un lien, le transformer en balise <a>
        if (typeof value === "string" && urlRegex.test(value)) 
        {
            value = value.split(urlRegex).map((part, index) =>
                urlRegex.test(part) ? (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer">
                        {part}
                    </a>
                ) : (
                    part
                )
            );
        }
        

        result.push(
            <div key={i} className="comment-pair">
                <strong>{commentArray[i]}</strong> : {value}
            </div>
        );
    }

    return result;
}

/*----------------------------------------------------------------
  function SendConfirmation(e, RFC_NUMBER) :
    - e : event pour empêcher l'action par défaut.
    - RFC_NUMBER : numéro de ticket à clôturer.

    Fonction qui envoie une requête PUT à l'API via l'API Route `/api/confirm`
  ----------------------------------------------------------------*/
const SendConfirmation = async (e, RFC_NUMBER,comment) => {
    e.preventDefault();

    try 
    {
        const response = await fetch(`/api/confirm/${RFC_NUMBER}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: comment
        });

        if (!response.ok) {
            throw new Error(`Erreur API : ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Action terminée avec succès :", data);
    } catch (error) 
    {
        console.error("Erreur lors de la confirmation :", error);
        alert(`Erreur : Impossible de terminer le ticket ${RFC_NUMBER}.`);
    } finally
    {
        
        alert(`Le ticket ${RFC_NUMBER} a été passé en attente de validation. Rechargez la page pour mettre l'affichage à jour`);
        window.location.reload();
    }
    
};

/*----------------------------------------------------------------
  Component Card :
    - allTickets : Liste des tickets à afficher.
    - allComments : Liste des commentaires associés aux tickets.
    
    Affiche chaque ticket sous forme de carte, avec la possibilité de marquer un ticket comme terminé.
  ----------------------------------------------------------------*/
const Card = ({ allTickets, allComments }) => {
    return (
        <div className="container">
            {allTickets.records
                .slice(0)
                .reverse() // On inverse la liste pour afficher les tickets récents en premier
                .map((ticket, index) => (
                    <div key={`ticket${index}`} className="ticket">
                        <label>{ticket.CATALOG_REQUEST.TITLE_FR}</label>
                        <br />
                        <label>Numéro de la requête : {ticket.RFC_NUMBER}</label>
                        <br />
                        <label>{formatDate(ticket.SUBMIT_DATE_UT)}</label>
                        <br />
                        <label>{ticket.STATUS.STATUS_FR}</label>
                        <br />
                        <br />
                        {renderComment(allComments.slice(0).reverse()[index])}
                        <br/>
                        <input className="CommentInput" id={`commentInput${index}`}  type="text" placeholder="Commentaire de résolution"></input>
                        
                        <button onClick={(e) => SendConfirmation(e, ticket.RFC_NUMBER,(document.getElementById(`commentInput${index}`) as HTMLInputElement).value)}>
                            clôturer le ticket
                        </button>


                    </div>
                ))}
        </div>
    );
};

export default Card;

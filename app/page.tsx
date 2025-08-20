"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import Card from './components/Card';

const Home = () => {
  const [allTickets, setAllTickets] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState(null);
  const [allComments, setAllComments] = useState([]);

  const [filters, setFilters] = useState({
    enCours: true,
    attenteValidation: false,
    cloture: false,
    archive: false,
    annule: false,
  });

  const filterOptions = [
    { label: "En attente de finalisation", key: "enCours", statusId: "26" },
    //{ label: "En cours", key: "enCours", statusId: "12" },
    { label: "En attente de validation", key: "attenteValidation", statusId: "9" },
    { label: "Clôturé", key: "cloture", statusId: "8" },
    { label: "Archivé", key: "archive", statusId: "7" },
    { label: "Annulé par le demandeur", key: "annule", statusId: "43" },
  ];

  const updateFilter = (key, newValue) => {
    setFilters((prev) => ({ ...prev, [key]: newValue }));
  };

  function parseComment(comment) {
    const str_cleaned = comment.replaceAll("<table>", "")
      .replaceAll("</table>", "")
      .replaceAll("<tr>", "")
      .replaceAll("</tr>", "")
      .replaceAll("</td>", "")
      .replaceAll("<p>", "")
      .replaceAll("</p>", "")
      .replaceAll("<b>", "")
      .replaceAll("</b>", "")
      .replaceAll("<ol>", "")
      .replaceAll("<li>", "")
      .replaceAll("<i>", "")
      .replaceAll("</ol>", "")
      .replaceAll("</li>", "")
      .replaceAll("</i>", "")
      .replaceAll("<tbody>", "")
      .replaceAll("</tbody>", "")
      .replaceAll("<strong>", "")
      .replaceAll("</strong>", "")
      .replaceAll("<br>", "\n")
      .replaceAll("<br />", `\n`)
      .replace("<td>", ""); // Replace normal pour ne supprimer que le premier

    return str_cleaned.split("<td>");
  }

  const fetchAllComments = async (filteredTickets) => {
    try {
      setLoadingComments(true);
      const commentsPromises = filteredTickets.map(async (ticket) => {
        const response = await fetch(`/api/tickets/${ticket.RFC_NUMBER}/comment`);
        if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);

        const data = await response.json();
        return parseComment(data.COMMENT);
      });

      setAllComments(await Promise.all(commentsPromises));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingComments(false);
    }
  };

  const getAllTickets = async () => {
    try {
      setLoadingRequests(true);
      setError(null);
      const response = await fetch(`/api/tickets`);

      if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);

      const data = await response.json();

      const filteredTickets = data.records.filter((ticket) =>
        filterOptions.some((opt) => filters[opt.key] && ticket.STATUS.STATUS_ID === opt.statusId)
      );

      setAllTickets(filteredTickets.reverse());
      fetchAllComments(filteredTickets); // Ne récupérer que les commentaires des tickets filtrés
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    getAllTickets();
  }, []);

  if (loadingRequests) return <p>Chargement des requêtes...</p>;
  if (loadingComments) return <p>Chargement des commentaires...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h1>Gestionnaire de Ticket Nexity</h1>
      <div className="logo">
        <Image src="/logo.png" width={699 / 2.2} height={414 / 2.2} alt="Stem Logo" />
      </div>

      <div className="filters">
        <h3>Filtres</h3>
      
        {filterOptions.map(({ label, key }) => (
          <label key={key} className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={(e) => updateFilter(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
        <br/>
        <button onClick={getAllTickets}>Filtrer</button>
      </div>

      

      {allTickets.length > 0 && allComments.length > 0 && <Card allTickets={{ records: allTickets }} allComments={allComments} />}
    </div>
  );
};

export default Home;

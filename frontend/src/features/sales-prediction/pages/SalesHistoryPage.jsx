import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteSalesEntry,
  getSalesEntries,
  updateSalesEntry,
} from "../services/salesPredictionApi";


const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


// ============================================================
// HELPERS
// ============================================================

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat().format(
    Math.round(number)
  );
}


function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.detail ||
    error?.message ||
    fallback
  );
}


// ============================================================
// MAIN PAGE
// ============================================================

function SalesHistoryPage() {
  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [entries, setEntries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [editingKey, setEditingKey] =
    useState("");

  const [editingValue, setEditingValue] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");


  // ==========================================================
  // LOAD SALES HISTORY
  // ==========================================================

  const loadEntries =
    async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getSalesEntries();

        setEntries(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        setError(
          getErrorMessage(
            err,
            "Unable to load monthly sales history."
          )
        );

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadEntries();
  }, []);


  // ==========================================================
  // FILTER / SEARCH
  // ==========================================================

  const filteredEntries =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return entries;
        }

        return entries.filter(
          (entry) => {
            const month =
              MONTHS[
                entry.month - 1
              ] || "";

            const period =
              `${month} ${entry.year}`
                .toLowerCase();

            const sales =
              String(
                entry.sales_count
              );

            return (
              period.includes(query) ||
              sales.includes(query)
            );
          }
        );
      },
      [
        entries,
        search,
      ]
    );


  // ==========================================================
  // START EDIT
  // ==========================================================

  const beginEdit =
    (entry) => {
      setEditingKey(
        `${entry.year}-${entry.month}`
      );

      setEditingValue(
        String(
          entry.sales_count
        )
      );

      setError("");
      setMessage("");
    };


  // ==========================================================
  // CANCEL EDIT
  // ==========================================================

  const cancelEdit =
    () => {
      setEditingKey("");
      setEditingValue("");
    };


  // ==========================================================
  // SAVE EDIT
  // ==========================================================

  const saveEdit =
    async (entry) => {
      const numericSales =
        Number(
          editingValue
        );

      if (
        !Number.isFinite(
          numericSales
        ) ||
        numericSales < 0
      ) {
        setError(
          "Please enter a valid non-negative sales count."
        );

        return;
      }

      setSaving(true);
      setError("");
      setMessage("");

      try {
        await updateSalesEntry({
          year:
            entry.year,

          month:
            entry.month,

          salesCount:
            Math.round(
              numericSales
            ),
        });

        await loadEntries();

        cancelEdit();

        setMessage(
          `${MONTHS[
            entry.month - 1
          ]} ${entry.year} sales record updated successfully.`
        );

      } catch (err) {

        setError(
          getErrorMessage(
            err,
            "Failed to update the sales record."
          )
        );

      } finally {
        setSaving(false);
      }
    };


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete =
    async (entry) => {
      const label =
        `${MONTHS[
          entry.month - 1
        ]} ${entry.year}`;

      const confirmed =
        window.confirm(
          `Delete the sales record for ${label}?`
        );

      if (!confirmed) {
        return;
      }

      setError("");
      setMessage("");

      try {
        await deleteSalesEntry({
          year:
            entry.year,

          month:
            entry.month,
        });

        await loadEntries();

        setMessage(
          `${label} sales record deleted successfully.`
        );

      } catch (err) {

        setError(
          getErrorMessage(
            err,
            "Failed to delete the sales record."
          )
        );
      }
    };


  // ==========================================================
  // RETURN TO FORECAST
  // ==========================================================

  const handleReturnToForecast =
    () => {
      navigate(-1);
    };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="history-page">
      <style>{styles}</style>


      {/* =================================================== */}
      {/* HERO */}
      {/* =================================================== */}

      <section className="history-hero">

        <div className="hero-content">

          <p className="eyebrow">
            Sales Data Management
          </p>

          <h1>
            Monthly Sales History
          </h1>

          <p className="hero-description">
            View, search, update, and delete
            monthly coffee sales records stored
            in MongoDB.
          </p>

        </div>


        {/* RETURN BUTTON */}

        <button
          type="button"
          className="back-button"
          onClick={
            handleReturnToForecast
          }
        >
          ← Return to Forecast
        </button>

      </section>


      {/* =================================================== */}
      {/* MESSAGES */}
      {/* =================================================== */}

      {(message || error) && (
        <div
          className={`notice ${
            error
              ? "notice-error"
              : "notice-success"
          }`}
        >
          {error || message}
        </div>
      )}


      {/* =================================================== */}
      {/* TOOLBAR */}
      {/* =================================================== */}

      <section className="panel toolbar">

        <div className="record-summary">

          <span className="record-label">
            Total Records
          </span>

          <strong className="record-count">
            {entries.length}
          </strong>

        </div>


        <div className="toolbar-actions">

          <input
            type="text"
            placeholder="Search month, year or sales..."
            value={search}
            onChange={
              (event) =>
                setSearch(
                  event.target.value
                )
            }
          />


          <button
            type="button"
            className="refresh-button"
            onClick={
              loadEntries
            }
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>

      </section>


      {/* =================================================== */}
      {/* SALES TABLE */}
      {/* =================================================== */}

      <section className="panel">

        <div className="panel-heading">

          <div>
            <p className="section-kicker">
              CRUD Management
            </p>

            <h2>
              Sales Records
            </h2>
          </div>


          <span className="badge">
            {filteredEntries.length} shown
          </span>

        </div>


        {/* LOADING */}

        {loading ? (
          <div className="empty-state">
            Loading monthly sales records...
          </div>


        /* NO DATA */

        ) : filteredEntries.length === 0 ? (
          <div className="empty-state">

            {search
              ? "No matching sales records found."
              : "No monthly sales records have been saved yet."}

          </div>


        /* TABLE */

        ) : (
          <div className="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Period
                  </th>

                  <th>
                    Sales Count
                  </th>

                  <th>
                    Created At
                  </th>

                  <th>
                    Last Updated
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredEntries.map(
                  (
                    entry,
                    index
                  ) => {
                    const key =
                      `${entry.year}-${entry.month}`;

                    const editing =
                      editingKey ===
                      key;


                    return (
                      <tr key={key}>


                        {/* NUMBER */}

                        <td>
                          {index + 1}
                        </td>


                        {/* PERIOD */}

                        <td>

                          <div className="period-cell">

                            <strong>
                              {
                                MONTHS[
                                  entry.month -
                                    1
                                ]
                              }
                            </strong>

                            <span>
                              {entry.year}
                            </span>

                          </div>

                        </td>


                        {/* SALES COUNT */}

                        <td>

                          {editing ? (

                            <input
                              className="table-input"
                              type="number"
                              min="0"
                              step="1"
                              value={
                                editingValue
                              }
                              onChange={
                                (
                                  event
                                ) =>
                                  setEditingValue(
                                    event
                                      .target
                                      .value
                                  )
                              }
                            />

                          ) : (

                            <strong className="sales-value">
                              {formatNumber(
                                entry.sales_count
                              )}
                            </strong>

                          )}

                        </td>


                        {/* CREATED */}

                        <td>

                          {entry.created_at
                            ? new Date(
                                entry.created_at
                              ).toLocaleString()
                            : "—"}

                        </td>


                        {/* UPDATED */}

                        <td>

                          {entry.updated_at
                            ? new Date(
                                entry.updated_at
                              ).toLocaleString()
                            : "—"}

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="action-row">

                            {editing ? (
                              <>

                                <button
                                  type="button"
                                  className="table-button save"
                                  disabled={saving}
                                  onClick={
                                    () =>
                                      saveEdit(
                                        entry
                                      )
                                  }
                                >
                                  {saving
                                    ? "Saving..."
                                    : "Save"}
                                </button>


                                <button
                                  type="button"
                                  className="table-button cancel"
                                  onClick={
                                    cancelEdit
                                  }
                                >
                                  Cancel
                                </button>

                              </>

                            ) : (
                              <>

                                <button
                                  type="button"
                                  className="table-button edit"
                                  onClick={
                                    () =>
                                      beginEdit(
                                        entry
                                      )
                                  }
                                >
                                  Edit
                                </button>


                                <button
                                  type="button"
                                  className="table-button delete"
                                  onClick={
                                    () =>
                                      handleDelete(
                                        entry
                                      )
                                  }
                                >
                                  Delete
                                </button>

                              </>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = `
  * {
    box-sizing: border-box;
  }


  body {
    margin: 0;
  }


  .history-page {
    min-height: 100vh;

    padding: 32px;

    background:
      radial-gradient(
        circle at top right,
        rgba(139, 90, 43, 0.12),
        transparent 32%
      ),
      radial-gradient(
        circle at bottom left,
        rgba(101, 67, 33, 0.08),
        transparent 38%
      ),
      linear-gradient(
        180deg,
        #faf6f1 0%,
        #f2e9dd 55%,
        #e8ddcd 100%
      );

    color: #2b1a10;

    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }


  /* ======================================================== */
  /* HERO */
  /* ======================================================== */


  .history-hero {
    max-width: 1250px;

    margin:
      0 auto 22px;

    padding: 32px;

    border-radius: 26px;

    background:
      radial-gradient(
        circle at 90% 10%,
        rgba(210, 165, 110, 0.18),
        transparent 45%
      ),
      linear-gradient(
        135deg,
        #2b1a10 0%,
        #4a2f1e 45%,
        #7a4a28 100%
      );

    color: #fdf8f1;

    display: flex;

    justify-content:
      space-between;

    align-items:
      center;

    gap: 25px;

    box-shadow:
      0 24px 60px
      rgba(43, 26, 16, 0.32),
      inset 0 1px 0
      rgba(232, 201, 160, 0.12);

    position: relative;

    overflow: hidden;
  }


  .history-hero::before {
    content: "";

    position: absolute;

    top: -90px;
    right: -90px;

    width: 260px;
    height: 260px;

    border-radius: 50%;

    background:
      radial-gradient(
        circle,
        rgba(232, 201, 160, 0.16),
        transparent 70%
      );

    pointer-events: none;
  }


  .hero-content {
    position: relative;
    z-index: 1;
  }


  .eyebrow,
  .section-kicker {
    margin: 0 0 7px;

    text-transform:
      uppercase;

    letter-spacing:
      0.12em;

    font-size: 11px;

    font-weight: 850;
  }


  .eyebrow {
    color: #e6c79c;
  }


  .section-kicker {
    color: #8b5a2b;
  }


  .history-hero h1 {
    margin: 0;

    font-size:
      clamp(
        30px,
        4vw,
        46px
      );

    color: #fdf8f1;

    letter-spacing: -0.5px;
  }


  .hero-description {
    margin:
      13px 0 0;

    color: #d8c3a5;

    line-height: 1.6;

    max-width: 650px;
  }


  /* ======================================================== */
  /* RETURN BUTTON */
  /* ======================================================== */


  .back-button {
    padding:
      12px 17px;

    border-radius: 12px;

    background:
      rgba(
        232,
        201,
        160,
        0.14
      );

    border:
      1px solid
      rgba(
        232,
        201,
        160,
        0.22
      );

    color: #fdf8f1;

    font-family: inherit;

    font-size: 12px;

    font-weight: 800;

    white-space: nowrap;

    cursor: pointer;

    position: relative;

    z-index: 1;

    transition:
      0.2s ease;
  }


  .back-button:hover {
    background:
      rgba(
        232,
        201,
        160,
        0.25
      );

    transform:
      translateY(-1px);
  }


  /* ======================================================== */
  /* NOTICES */
  /* ======================================================== */


  .notice {
    max-width: 1250px;

    margin:
      0 auto 20px;

    padding:
      14px 17px;

    border-radius: 13px;

    font-weight: 700;
  }


  .notice-success {
    background: #eaf4e2;

    border:
      1px solid #b8d6a4;

    color: #3f6a2e;
  }


  .notice-error {
    background: #faeaea;

    border:
      1px solid #eab5b0;

    color: #8f322b;
  }


  /* ======================================================== */
  /* PANELS */
  /* ======================================================== */


  .panel {
    max-width: 1250px;

    margin:
      0 auto 20px;

    padding: 24px;

    border-radius: 22px;

    background:
      linear-gradient(
        180deg,
        #fffdfa 0%,
        #fdf8f1 100%
      );

    border:
      1px solid #e3d5c2;

    box-shadow:
      0 12px 34px
      rgba(61, 43, 31, 0.08),
      0 2px 6px
      rgba(61, 43, 31, 0.04);
  }


  /* ======================================================== */
  /* TOOLBAR */
  /* ======================================================== */


  .toolbar {
    display: flex;

    justify-content:
      space-between;

    align-items:
      center;

    gap: 20px;
  }


  .record-summary {
    display: flex;
    flex-direction: column;
  }


  .record-label {
    display: block;

    color: #8a7360;

    font-size: 11px;

    margin-bottom: 4px;

    text-transform:
      uppercase;

    font-weight: 800;

    letter-spacing:
      0.06em;
  }


  .record-count {
    font-size: 29px;

    color: #2b1a10;
  }


  .toolbar-actions {
    display: flex;

    align-items: center;

    gap: 10px;
  }


  .toolbar-actions input {
    min-width: 280px;

    padding:
      11px 13px;

    border:
      1px solid #d8c6ae;

    border-radius: 11px;

    outline: none;

    background: #fffdfa;

    color: #2b1a10;

    font: inherit;

    transition:
      0.2s ease;
  }


  .toolbar-actions input::placeholder {
    color: #b39d84;
  }


  .toolbar-actions input:focus {
    border-color: #8b5a2b;

    box-shadow:
      0 0 0 3px
      rgba(
        139,
        90,
        43,
        0.14
      );
  }


  .refresh-button {
    border: 0;

    padding:
      11px 15px;

    border-radius: 11px;

    background:
      linear-gradient(
        135deg,
        #4a2f1e 0%,
        #7a4a28 100%
      );

    color: #fdf8f1;

    font-weight: 800;

    cursor: pointer;

    box-shadow:
      0 4px 14px
      rgba(
        74,
        47,
        30,
        0.28
      );

    transition:
      0.2s ease;
  }


  .refresh-button:hover:not(:disabled) {
    background:
      linear-gradient(
        135deg,
        #3a2416 0%,
        #8b5a2b 100%
      );

    transform:
      translateY(-1px);
  }


  .refresh-button:disabled {
    opacity: 0.6;

    cursor: not-allowed;
  }


  /* ======================================================== */
  /* PANEL HEADING */
  /* ======================================================== */


  .panel-heading {
    display: flex;

    justify-content:
      space-between;

    align-items:
      flex-start;

    gap: 20px;
  }


  .panel-heading h2 {
    margin: 0;

    font-size: 24px;

    color: #2b1a10;
  }


  .badge {
    padding:
      7px 10px;

    border-radius: 999px;

    background: #f2e5d2;

    color: #6b4423;

    border:
      1px solid #e6d3b8;

    font-size: 11px;

    font-weight: 850;
  }


  /* ======================================================== */
  /* TABLE */
  /* ======================================================== */


  .table-wrap {
    margin-top: 20px;

    overflow-x: auto;

    border:
      1px solid #ead9c2;

    border-radius: 14px;
  }


  table {
    width: 100%;

    min-width: 950px;

    border-collapse:
      collapse;

    background: #fffdfa;
  }


  th,
  td {
    padding: 14px;

    text-align: left;

    vertical-align:
      middle;

    border-bottom:
      1px solid #f2e9dd;
  }


  th {
    background: #f5ede1;

    color: #6b5545;

    font-size: 11px;

    text-transform:
      uppercase;

    letter-spacing:
      0.05em;

    white-space: nowrap;
  }


  td {
    font-size: 13px;

    color: #4a3527;
  }


  tbody tr:hover {
    background: #faf4ea;
  }


  tbody tr:last-child td {
    border-bottom: 0;
  }


  /* ======================================================== */
  /* PERIOD CELL */
  /* ======================================================== */


  .period-cell {
    display: flex;

    flex-direction: column;

    gap: 2px;
  }


  .period-cell strong {
    color: #4a2f1e;

    font-size: 14px;
  }


  .period-cell span {
    color: #a89581;

    font-size: 11px;
  }


  .sales-value {
    color: #6b4423;

    font-size: 15px;
  }


  /* ======================================================== */
  /* ACTION BUTTONS */
  /* ======================================================== */


  .action-row {
    display: flex;

    gap: 7px;
  }


  .table-button {
    border:
      1px solid
      transparent;

    padding:
      7px 11px;

    border-radius: 8px;

    font: inherit;

    font-size: 11px;

    font-weight: 800;

    cursor: pointer;

    transition:
      0.2s ease;
  }


  .table-button.edit,
  .table-button.save {
    background: #f2e5d2;

    color: #6b4423;

    border-color:
      #e0cba8;
  }


  .table-button.edit:hover,
  .table-button.save:hover {
    background: #e8d8c2;
  }


  .table-button.cancel {
    background: #f0ebe3;

    color: #7a6857;

    border-color:
      #e0d5c4;
  }


  .table-button.cancel:hover {
    background: #e5dccf;
  }


  .table-button.delete {
    background: #f7d9d4;

    color: #97372c;

    border-color:
      #eab5b0;
  }


  .table-button.delete:hover {
    background: #efc7bf;
  }


  .table-button:disabled {
    opacity: 0.6;

    cursor: not-allowed;
  }


  /* ======================================================== */
  /* TABLE INPUT */
  /* ======================================================== */


  .table-input {
    max-width: 150px;

    padding:
      8px 10px;

    border:
      1px solid #d8c6ae;

    border-radius: 9px;

    outline: none;

    background: #fffdfa;

    color: #2b1a10;

    transition:
      0.2s ease;
  }


  .table-input:focus {
    border-color: #8b5a2b;

    box-shadow:
      0 0 0 3px
      rgba(
        139,
        90,
        43,
        0.14
      );
  }


  /* ======================================================== */
  /* EMPTY STATE */
  /* ======================================================== */


  .empty-state {
    margin-top: 20px;

    padding: 35px;

    text-align: center;

    border:
      1px dashed #d8c6ae;

    border-radius: 14px;

    color: #8a7360;

    background: #fdf8f1;
  }


  /* ======================================================== */
  /* RESPONSIVE */
  /* ======================================================== */


  @media (max-width: 760px) {

    .history-page {
      padding: 16px;
    }


    .history-hero {
      flex-direction: column;

      align-items:
        flex-start;

      padding: 22px;
    }


    .back-button {
      width: 100%;

      text-align: center;
    }


    .toolbar {
      flex-direction:
        column;

      align-items:
        stretch;
    }


    .toolbar-actions {
      flex-direction:
        column;

      align-items:
        stretch;
    }


    .toolbar-actions input {
      min-width: 0;

      width: 100%;
    }


    .refresh-button {
      width: 100%;
    }

  }
`;


export default SalesHistoryPage;
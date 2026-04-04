export default function SimpleTable({ columns = [], data = [] }) {
  return (
    <div className="table-wrap">
      <table className="simple-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-cell">
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id || row.venta_id || index}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
import { timesheetTitle } from '../lib/timesheet.js';

// Only visible when printing: the same content as the PDF, without any of the app's controls.
const PrintView = ({ sheet }) => (
  <article className="hidden text-black print:block">
    <h1 className="text-3xl font-extrabold">{timesheetTitle(sheet)}</h1>
    {sheet.range && <p className="mt-1 text-lg text-neutral-600">{sheet.range}</p>}
    <table className="mt-6 w-full border-collapse text-left tabular-nums">
      <thead>
        <tr className="border-b-2 border-black">
          {['Date', 'Start', 'End', 'Break'].map((heading) => (
            <th key={heading} className="py-2 pr-4">
              {heading}
            </th>
          ))}
          <th className="py-2 text-right">Hours</th>
        </tr>
      </thead>
      <tbody>
        {sheet.rows.map((row, i) => (
          <tr key={i} className="border-b border-neutral-300">
            <td className="py-2 pr-4">{row.date}</td>
            <td className="py-2 pr-4">{row.start}</td>
            <td className="py-2 pr-4">{row.end}</td>
            <td className="py-2 pr-4">{row.break}</td>
            <td className="py-2 text-right font-semibold">{row.hours}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-black">
          <td colSpan={4} className="py-2 font-bold">
            Total
          </td>
          <td className="py-2 text-right font-extrabold">{sheet.total}</td>
        </tr>
      </tfoot>
    </table>
  </article>
);

export default PrintView;

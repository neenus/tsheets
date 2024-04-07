import React, { useState } from 'react';
import { Stack, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const TimeEntryCard = () => {
  const [timeRows, setTimeRows] = useState([
    { date: '', startTime: '', endTime: '', breakTime: '', hoursWorked: '' },
  ]);

  const calculateHoursWorked = (index) => {
    const start = new Date(`${timeRows[index].date} ${timeRows[index].startTime}`);
    const end = new Date(`${timeRows[index].date} ${timeRows[index].endTime}`);
    const breakInMilliseconds = timeRows[index].breakTime * 60000; // Convert minutes to milliseconds

    const timeDiff = end - start - breakInMilliseconds;
    const hours = Math.floor(timeDiff / 3600000); // Convert milliseconds to hours
    const minutes = Math.floor((timeDiff % 3600000) / 60000); // Convert remainder to minutes
    const formattedHoursWorked = `${hours} hours ${minutes} minutes`;

    const updatedRows = [...timeRows];
    updatedRows[index].hoursWorked = formattedHoursWorked;
    setTimeRows(updatedRows);
  };

  const calculateTotalHoursWorked = () => {
    let totalMilliseconds = 0;

    timeRows.forEach((row) => {
      const start = new Date(`${row.date} ${row.startTime}`);
      const end = new Date(`${row.date} ${row.endTime}`);
      const breakInMilliseconds = row.breakTime * 60000; // Convert minutes to milliseconds

      totalMilliseconds += end - start - breakInMilliseconds;
    });

    let totalHours = Math.floor(totalMilliseconds / 3600000); // Convert milliseconds to hours
    if (totalMilliseconds < 60000) {
      totalHours = 0;
    }
    const totalMinutes = Math.floor((totalMilliseconds % 3600000) / 60000); // Convert remainder to minutes
    if (isNaN(totalHours) || isNaN(totalMinutes) || totalMilliseconds < 60000) {
      return '0 hours 0 minutes';
    }
    return `${totalHours} hours ${totalMinutes} minutes`;
  };

  const handleInputChange = (value, index, key) => {
    const updatedRows = [...timeRows];
    updatedRows[index][key] = value;
    setTimeRows(updatedRows);

    if (timeRows[index].date && timeRows[index].startTime && timeRows[index].endTime) {
      calculateHoursWorked(index);
    }
  };

  const addRow = () => {
    setTimeRows([
      ...timeRows,
      { date: '', startTime: '', endTime: '', breakTime: '', hoursWorked: '' },
    ]);
  };

  const removeRow = (index) => {
    const updatedRows = timeRows.filter((row, i) => i !== index);
    setTimeRows(updatedRows);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {timeRows.map((row, index) => (
        <div key={index} className="mb-4 border rounded p-4">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexGrow={1} width={{ xs: '100%', sm: 'auto' }}>
              <TextField
                label="Date"
                InputLabelProps={{ shrink: true }}
                type="date"
                value={row.date}
                onChange={(e) => handleInputChange(e.target.value, index, 'date')}
              />
              <TextField
                label="Start Time"
                InputLabelProps={{ shrink: true }}
                type="time"
                value={row.startTime}
                onChange={(e) => handleInputChange(e.target.value, index, 'startTime')}
              />
              <TextField
                label="End Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={row.endTime}
                onChange={(e) => handleInputChange(e.target.value, index, 'endTime')}
              />
              <TextField
                label="Break (minutes)"
                type="number"
                InputLabelProps={{ shrink: true }}
                value={row.breakTime}
                onChange={(e) => handleInputChange(e.target.value, index, 'breakTime')}
              />
            </Stack>
            <IconButton color="warning" aria-label="delete" size="large" onClick={() => removeRow(index)}>
              <DeleteIcon />
            </IconButton>
          </Stack>

        </div>
      ))}
      <button onClick={addRow} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Entry</button>
      <div className="mt-4 mb-10">
        <strong>Total Hours Worked:</strong> {calculateTotalHoursWorked()}
      </div>
    </div>
  );
}

export default TimeEntryCard;
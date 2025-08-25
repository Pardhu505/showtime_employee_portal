import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Upload } from 'lucide-react';

const AdminAttendanceUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setUploadMessage('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/attendance/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to upload file.');
      }

      setUploadMessage(result.message || 'File uploaded successfully!');
      setSelectedFile(null); // Clear file input
    } catch (error) {
      setUploadMessage(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Attendance Report</CardTitle>
        <CardDescription>Upload the employee attendance report in CSV format.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
              className="max-w-xs"
            />
            <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          {uploadMessage && (
            <p className="text-sm text-gray-600">{uploadMessage}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { getAllEmployees } from "../data/mock";
import { useEffect, useCallback } from "react";

const AttendanceReport = () => {
  const { user } = useAuth();
  const [date, setDate] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTeamEmails = useCallback(() => {
    if (!user) return [];
    const allEmployees = getAllEmployees();
    if (user.designation === "Reporting manager") {
      return allEmployees
        .filter(emp => emp.Reviewer === user.name)
        .map(emp => emp["Email ID"]);
    }
    return [user.email];
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const teamEmails = getTeamEmails();
      if (teamEmails.length === 0) {
        setIsLoading(false);
        return;
      }

      const startDate = format(date.from, "yyyy-MM-dd");
      const endDate = format(date.to, "yyyy-MM-dd");

      try {
        const promises = teamEmails.map(email => {
          const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/attendance`);
          url.searchParams.append("employee_email", email);
          url.searchParams.append("start_date", startDate);
          url.searchParams.append("end_date", endDate);
          return fetch(url).then(res => res.json());
        });

        const results = await Promise.all(promises);
        const combinedData = results.flat();
        setAttendanceData(combinedData);
      } catch (err) {
        setError("Failed to fetch attendance data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (date.from && date.to) {
      fetchData();
    }
  }, [date, getTeamEmails]);

  const summary = attendanceData.reduce(
    (acc, record) => {
      const status = record.status.toLowerCase();
      if (status.includes("present")) {
        acc.present++;
      } else if (status.includes("absent")) {
        acc.absent++;
      } else if (status.includes("holiday")) {
        acc.holidays++;
      } else if (status.includes("weekoff")) {
        acc.weekoffs++;
      }
      return acc;
    },
    { present: 0, absent: 0, holidays: 0, weekoffs: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Attendance Report</h2>
        <div className={cn("grid gap-2")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Present Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.present}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Absent Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.absent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.holidays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekoffs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.weekoffs}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>In Time</TableHead>
                  <TableHead>Out Time</TableHead>
                  <TableHead>Work Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.att_date}</TableCell>
                    <TableCell>{record.employee_name}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.in_time}</TableCell>
                    <TableCell>{record.out_time}</TableCell>
                    <TableCell>{record.work_dur}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const Attendance = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>
      {user && user.isAdmin ? (
        <AdminAttendanceUploader />
      ) : (
        <AttendanceReport />
      )}
    </div>
  );
};

export default Attendance;

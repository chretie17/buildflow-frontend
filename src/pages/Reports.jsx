import React, { useEffect, useState } from "react";
import api from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

// Card Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 border-b ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-semibold ${className}`}>
    {children}
  </h2>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

// Alert Components
const Alert = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-50 text-blue-800 border-blue-200",
    destructive: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertTitle = ({ children }) => (
  <h5 className="font-medium mb-1">{children}</h5>
);

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);
// Common table component for consistent styling
const Table = ({ headers, children }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="text-left text-sm font-semibold text-gray-600 p-4 border-b-2 border-gray-200 bg-gray-50 sticky top-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {children}
        </tbody>
      </table>
    </div>
  );
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusStyles = (status) => {
      const styles = {
        'On Track': 'bg-green-50 text-green-700 border-green-100',
        'At Risk': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'Delayed': 'bg-red-50 text-red-700 border-red-100',
        'Overdue': 'bg-red-100 text-red-800 border-red-200',
        'Completed': 'bg-blue-50 text-blue-700 border-blue-100',
        'in_progress': 'bg-blue-50 text-blue-700 border-blue-100',
        'planning': 'bg-purple-50 text-purple-700 border-purple-100'
      };
      return styles[status] || 'bg-gray-50 text-gray-700 border-gray-100';
    };
  
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
        {status}
      </span>
    );
  };
  
  // Progress bar component
  const ProgressBar = ({ percentage }) => (
    <div className="flex items-center gap-3">
      <div className="flex-grow bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full rounded-full bg-[#E05F00]" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-600 min-w-[45px]">
        {percentage}%
      </span>
    </div>
  );
  
  // Enhanced table row styles
  const TableRow = ({ children, isEven }) => (
    <tr className={`
      border-b border-gray-100 hover:bg-gray-50 transition-colors
      ${isEven ? 'bg-white' : 'bg-gray-50/30'}
    `}>
      {children}
    </tr>
  );
  
  // Enhanced table cell
  const TableCell = ({ children, className = "" }) => (
    <td className={`p-4 text-sm text-gray-600 ${className}`}>
      {children}
    </td>
  );

const ReportsPage = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [projectStatus, setProjectStatus] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
  
    useEffect(() => {
      fetchReports();
    }, []);
    
  
    const clearFilters = async () => {
        setLoading(true);
        setError("");
        
        try {
          // Reset dates first
          setStartDate(null);
          setEndDate(null);
          
          // Fetch without any params to get all data
          const [projectOverview, userPerformance, statusReport, recentUpdates] = 
            await Promise.all([
              api.get("/reports/project-overview"),
              api.get("/reports/user-performance"),
              api.get("/reports/project-status"),
              api.get("/reports/recent-updates"),
            ]);
      
          setProjects(projectOverview.data || []);
          setUsers(userPerformance.data || []);
          setProjectStatus(statusReport.data || []);
          setUpdates(recentUpdates.data || []);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch reports");
          console.error("Error fetching reports:", err);
        } finally {
          setLoading(false);
        }
      };
  
      const generatePDF = (projects, projectStatus, users, updates, startDate, endDate) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const brandColor = [224, 95, 0]; // #E05F00
      
        // Add elegant header
        doc.setFillColor(...brandColor);
        doc.rect(0, 0, pageWidth, 2, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(60, 60, 60);
        doc.text('Reports Doc', 14, 20);
        
        // Add date information
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - 14, 20, { align: 'right' });
        
        if (startDate || endDate) {
          const dateRange = `Date Range: ${startDate ? startDate.toLocaleDateString() : 'Start'} to ${endDate ? endDate.toLocaleDateString() : 'End'}`;
          doc.text(dateRange, pageWidth - 14, 25, { align: 'right' });
        }
      
        let yPos = 35;
      
        // Common table styles
        const tableStyle = {
          theme: 'plain',
          styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [240, 240, 240],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [250, 250, 250],
            textColor: [80, 80, 80],
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [220, 220, 220]
          },
          bodyStyles: {
            textColor: [70, 70, 70]
          },
          alternateRowStyles: {
            fillColor: [252, 252, 252]
          }
        };
      
        // Helper function for section headers
        const addSectionHeader = (title, y) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(...brandColor);
          doc.text(title, 14, y);
          return y + 10;
        };
      
        // Only add Project Status Overview if there's data
        if (projectStatus && projectStatus.length > 0) {
          yPos = addSectionHeader('Project Status Overview', yPos);
          
          doc.autoTable({
            startY: yPos,
            head: [['Project Name', 'Completion', 'Days Left', 'Status', 'Tasks']],
            body: projectStatus.map(project => [
              project.project_name,
              `${project.completion_percentage}%`,
              project.days_remaining < 0 ? 'Overdue' : `${project.days_remaining} days`,
              project.project_status,
              `${project.completed_tasks}/${project.total_tasks}`
            ]),
            ...tableStyle,
            columnStyles: {
              0: { cellWidth: 50 },
              3: { cellWidth: 30 }
            }
          });
      
          yPos = doc.previousAutoTable.finalY + 20;
        }
      
        // Only add Team Performance if there's data
        if (users && users.length > 0) {
          if (yPos + 100 > doc.internal.pageSize.height) {
            doc.addPage();
            yPos = 20;
          }
          
          yPos = addSectionHeader('Team Performance', yPos);
          
          doc.autoTable({
            startY: yPos,
            head: [['Team Member', 'Total Tasks', 'Completed', 'Delayed', 'Rate']],
            body: users.map(user => [
              user.username,
              user.total_tasks,
              user.completed_tasks,
              user.delayed_tasks,
              `${user.completion_rate}%`
            ]),
            ...tableStyle
          });
      
          yPos = doc.previousAutoTable.finalY + 20;
        }
      
        // Only add Project Details if there's data
        if (projects && projects.length > 0) {
          if (yPos + 100 > doc.internal.pageSize.height) {
            doc.addPage();
            yPos = 20;
          }
      
          yPos = addSectionHeader('Project Details', yPos);
          
          doc.autoTable({
            startY: yPos,
            head: [['Project Name', 'Status', 'Start Date', 'End Date', 'Assigned To', 'Progress']],
            body: projects.map(project => [
              project.project_name,
              project.status,
              formatDate(project.start_date),
              formatDate(project.end_date),
              project.assigned_user,
              `${project.task_completion_rate}%`
            ]),
            ...tableStyle,
            columnStyles: {
              0: { cellWidth: 40 },
              1: { cellWidth: 25 },
              4: { cellWidth: 30 }
            }
          });
      
          yPos = doc.previousAutoTable.finalY + 20;
        }
      
        // Only add Recent Updates if there's data
        if (updates && updates.length > 0) {
          if (yPos + 60 > doc.internal.pageSize.height) {
            doc.addPage();
            yPos = 20;
          }
      
          yPos = addSectionHeader('Recent Updates', yPos);
          
          doc.autoTable({
            startY: yPos,
            head: [['Month', 'Projects Updated']],
            body: updates.map(update => [
              update.month,
              update.projects_updated
            ]),
            ...tableStyle
          });
        }
      
        // Add elegant footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
      
        for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
          doc.setFillColor(...brandColor);
          doc.rect(0, doc.internal.pageSize.height - 2, pageWidth, 2, 'F');
        }
      
        // Save the PDF
        doc.save('reports-dashboard.pdf');
      };

      const getStatusColorForPDF = (status) => {
        const colors = {
          'On Track': [46, 204, 113],
          'At Risk': [241, 196, 15],
          'Delayed': [231, 76, 60],
          'Overdue': [192, 57, 43],
          'Completed': [52, 152, 219],
          'in_progress': [52, 152, 219],
          'planning': [241, 196, 15]
        };
        return colors[status] || [149, 165, 166];
      };
      const getCompletionColor = (rate) => {
        if (rate >= 80) return [46, 204, 113];
        if (rate >= 50) return [241, 196, 15];
        return [231, 76, 60];
      };
      
  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (startDate) {
        params.start_date = startDate.toISOString().split("T")[0];
      }
      if (endDate) {
        params.end_date = endDate.toISOString().split("T")[0];
      }

      const [projectOverview, userPerformance, statusReport, recentUpdates] = 
        await Promise.all([
          api.get("/reports/project-overview", { params }),
          api.get("/reports/user-performance", { params }),
          api.get("/reports/project-status", { params }),
          api.get("/reports/recent-updates", { params }),
        ]);

      setProjects(projectOverview.data || []);
      setUsers(userPerformance.data || []);
      setProjectStatus(statusReport.data || []);
      setUpdates(recentUpdates.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reports");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'On Track': 'bg-green-100 text-green-800',
      'At Risk': 'bg-yellow-100 text-yellow-800',
      'Delayed': 'bg-red-100 text-red-800',
      'Overdue': 'bg-red-200 text-red-900',
      'Completed': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📊 Reports Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                className="border rounded p-2 w-40"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                className="border rounded p-2 w-40"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select end date"
                minDate={startDate}
              />
            </div>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Apply Filter"}
            </button>
            <button
  onClick={clearFilters}
  disabled={loading || (!startDate && !endDate)}
  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
>
  Clear Filters
</button>
            <button
              onClick={() => generatePDF(projects, projectStatus, users, updates, startDate, endDate)}
              disabled={loading}
              className="px-4 py-2 bg-[#E05F00] text-white rounded hover:bg-[#D05500] transition disabled:opacity-50 flex items-center gap-2"
            >
              <span>Download Report</span>
              {loading && <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />}
            </button>
          </div>
        </CardContent>
      </Card>
  
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
  
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Project Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table headers={["Project Name", "Completion", "Days Left", "Status", "Tasks Progress"]}>
                {projectStatus.map((project, index) => (
                  <TableRow key={project.project_id || index} isEven={index % 2 === 0}>
                    <TableCell className="font-medium text-gray-700">{project.project_name}</TableCell>
                    <TableCell>
                      <ProgressBar percentage={parseFloat(project.completion_percentage)} />
                    </TableCell>
                    <TableCell>
                      {project.days_remaining < 0 
                        ? <span className="text-red-600 font-medium">Overdue</span>
                        : `${project.days_remaining} days`
                      }
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.project_status} />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{project.completed_tasks}</span>
                      <span className="text-gray-400"> / </span>
                      <span>{project.total_tasks} tasks</span>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </CardContent>
          </Card>
  
          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle>👥 Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table headers={["Team Member", "Total Tasks", "Completed", "Delayed", "Completion Rate"]}>
                {users.map((user, index) => (
                  <TableRow key={index} isEven={index % 2 === 0}>
                    <TableCell className="font-medium text-gray-700">{user.username}</TableCell>
                    <TableCell>{user.total_tasks}</TableCell>
                    <TableCell className="text-green-600">{user.completed_tasks}</TableCell>
                    <TableCell className="text-red-600">{user.delayed_tasks}</TableCell>
                    <TableCell>
                      <ProgressBar percentage={parseFloat(user.completion_rate)} />
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </CardContent>
          </Card>
  
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table headers={["Project Name", "Status", "Start Date", "End Date", "Assigned To", "Task Completion"]}>
                {projects.map((project, index) => (
                  <TableRow key={index} isEven={index % 2 === 0}>
                    <TableCell className="font-medium text-gray-700">{project.project_name}</TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>{formatDate(project.start_date)}</TableCell>
                    <TableCell>{formatDate(project.end_date)}</TableCell>
                    <TableCell>{project.assigned_user}</TableCell>
                    <TableCell>
                      <ProgressBar percentage={parseFloat(project.task_completion_rate)} />
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </CardContent>
          </Card>
  
          {/* Recent Updates */}
          <Card>
            <CardHeader>
              <CardTitle>🔄 Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table headers={["Month", "Projects Updated"]}>
                {updates.map((update, index) => (
                  <TableRow key={index} isEven={index % 2 === 0}>
                    <TableCell className="font-medium text-gray-700">{update.month}</TableCell>
                    <TableCell>{update.projects_updated}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
export default ReportsPage;

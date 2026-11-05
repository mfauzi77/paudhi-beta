import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, RefreshCw, Eye, X, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import paudPublicApiService from '../../utils/paudPublicApiService';
import PAUDYearFilter from '../../components/PAUDDashboard/PAUDYearFilter';

function PublicRanPaudDashboard() {
  const [selectedYear, setSelectedYear] = useState("all");
  const [dashboardData, setDashboardData] = useState(null);
  const [klData, setKlData] = useState([]);
  const [indicatorSummary, setIndicatorSummary] = useState({ tercapai: 0, tidakTercapai: 0, belumLapor: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Program list state (untuk tabel Program seperti di admin)
  const [programData, setProgramData] = useState([]);
  // Modal detail Program (sesuai admin)
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [programDetailLoading, setProgramDetailLoading] = useState(false);
  // Summary totals (samakan dengan dashboard ran)
  const [totalStats, setTotalStats] = useState({
    totalProgram: 0,
    totalRO: 0,
    totalTercapai: 0,
    totalTidakTercapai: 0,
    totalBelumLapor: 0,
    totalIndikator: 0, // ✅ ADDED: Total indikator
    totalKL: 0,
  });
  // Heatmap data state
  const [heatmapData, setHeatmapData] = useState([]);

  // Filter dan Pagination states
  const [filteredProgramData, setFilteredProgramData] = useState([]);
  const [selectedKLFilter, setSelectedKLFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [availableKLs, setAvailableKLs] = useState([]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const hasValidYearData = (program, year) => {
    if (!program || !Array.isArray(program.indikators)) return false;
    const yearNum = parseInt(year, 10);
    return program.indikators.some((indikator) => {
      const tahunData = Array.isArray(indikator.tahunData) ? indikator.tahunData : [];
      return tahunData.some((td) => {
        const tdYear = parseInt(td.tahun, 10);
        if (Number.isNaN(tdYear) || tdYear !== yearNum) return false;
        const target = td.target;
        const realisasi = td.realisasi;
        const validTarget = target !== null && target !== undefined && target !== '' && target !== '-';
        const validRealisasi = realisasi !== null && realisasi !== undefined && realisasi !== '' && realisasi !== '-';
        return validTarget || validRealisasi;
      });
    });
  };

  // Helpers for robust zero and presence checks
  const hasValue = (val) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim() !== '';
    return true;
  };
  const isZeroVal = (val) => {
    if (val === null || val === undefined) return false;
    const str = String(val).replace('%', '').replace(',', '.').trim();
    const num = parseFloat(str);
    if (Number.isNaN(num)) return false;
    return num === 0;
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchProgramData()
      ]);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      setError("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      console.log("🔍 Fetching dashboard data for year:", selectedYear);
      const yearParam = selectedYear === "all" ? "" : selectedYear;
      const response = await paudPublicApiService.getDashboardSummaryUnifiedPublic(yearParam);
      console.log("📊 Dashboard response:", response);
      
      if (response.success) {
        setDashboardData(response.data);
        // ✅ REMOVED: processChartData(response.data) - will be calculated manually in useEffect
        
        // ✅ REMOVED: Update total stats from API - will be calculated manually in useEffect
        // setTotalStats({
        //   totalProgram: response.data.totalProgram || 0,
        //   totalRO: response.data.totalRO || 0,
        //   totalTercapai: response.data.totalDone || 0,
        //   totalTidakTercapai: response.data.totalProgress || 0,
        //   totalBelumLapor: response.data.totalBelum || 0,
        // });
      } else {
        throw new Error(response.message || "Gagal mengambil data dashboard");
      }
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      throw new Error("Gagal mengambil data dashboard: " + error.message);
    }
  };



  const handleRefresh = () => {
    fetchAllData();
  };

  // ================= Program Data (Public) =================
  const fetchProgramData = async () => {
    try {
      const filters = {
        limit: selectedYear === 'all' ? 500 : 100,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };
      if (selectedYear !== 'all') {
        filters.year = selectedYear;
      }
      
      console.log("🔍 Fetching program data with filters:", filters);
      const response = await paudPublicApiService.getRanPaudDataPublic(filters);
      
      if (response.success) {
        console.log("📊 Raw program data received:", response.data);
        
        // ✅ DEBUG: Log BPS data specifically
        if (selectedYear === '2020') {
          const bpsData = response.data?.filter(p => p.klName === 'BPS');
          console.log("🔍 BPS Data from API 2020:", bpsData);
        }

        let rawData = Array.isArray(response.data) ? response.data : [];
        if (selectedYear !== 'all') {
          rawData = rawData.filter(program => hasValidYearData(program, selectedYear));
        }
        
        const processed = rawData.map(processProgramData);
        setProgramData(processed);
        
        // Extract unique KLs for filter dropdown
        const uniqueKLs = [...new Set(processed.map(item => item.klName).filter(Boolean))];
        setAvailableKLs(uniqueKLs);
        
        // Initialize filtered data with all data
        setFilteredProgramData(processed);
        processChartData(processed);
      } else {
        console.error('Failed to fetch program data (public):', response.message);
        setProgramData([]);
      }
    } catch (err) {
      console.error('Error fetching program data (public):', err);
      setProgramData([]);
    }
  };

  // Function untuk memproses data filter
  const processFilteredData = () => {
    if (!programData || programData.length === 0) {
      setFilteredProgramData([]);
      return;
    }

    let filtered = [...programData];

    // Filter berdasarkan KL
    if (selectedKLFilter !== "all") {
      filtered = filtered.filter(item => item.klName === selectedKLFilter);
    }

    // Filter berdasarkan search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.klName?.toLowerCase().includes(searchLower) ||
        item.program?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProgramData(filtered);
  };

  const getPaginatedData = () => {
    if (!filteredProgramData || filteredProgramData.length === 0) {
      return [];
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProgramData.slice(startIndex, endIndex);
  };

  // Function untuk mendapatkan total pages
  const getTotalPages = () => {
    if (!filteredProgramData || filteredProgramData.length === 0) {
      return 0;
    }
    return Math.ceil(filteredProgramData.length / itemsPerPage);
  };

  // Function untuk handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function untuk handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Function untuk memproses data chart berdasarkan data yang sudah difilter
  const processChartData = (sourceData = filteredProgramData) => {
    try {
      const dataToUse = Array.isArray(sourceData) ? sourceData : [];
      const klMap = new Map();
      let totalPrograms = 0;
      let tercapai = 0;
      let tidakTercapai = 0;
      let belumLapor = 0;
      let totalIndikators = 0;

      // Gunakan data yang diberikan atau filteredProgramData untuk chart
      dataToUse.forEach((program) => {
        totalPrograms += 1;
        const indikators = Array.isArray(program.indikators) ? program.indikators : [];
        
        // Determine program status based on its indicators
        let programStatus = "BELUM LAPORAN";
        let hasValidData = false;
        
        if (indikators.length > 0) {
          // Check if any indicator has valid data
          indikators.forEach((indikator) => {
            let yd;
            const tahunDataArray = Array.isArray(indikator.tahunData) ? indikator.tahunData : [];

            if (selectedYear === "all") {
              // For "Seluruh Tahun", use the latest valid year available across all tahunData entries
              const validYears = tahunDataArray
                .filter((t) => {
                  const target = t.target;
                  const realisasi = t.realisasi;
                  return t && (
                    (target !== null && target !== undefined && String(target).trim() !== '' && String(target).trim() !== '-') ||
                    (realisasi !== null && realisasi !== undefined && String(realisasi).trim() !== '' && String(realisasi).trim() !== '-')
                  );
                })
                .sort((a, b) => parseInt(b.tahun, 10) - parseInt(a.tahun, 10));
              yd = validYears.length > 0 ? validYears[0] : undefined;
            } else {
              // For specific year, find data for that year
              yd = tahunDataArray.find((t) => parseInt(t.tahun, 10) === parseInt(selectedYear, 10));
            }

            // Improved logic for determining program status
            if (yd && yd.target && yd.realisasi && yd.target !== '-' && yd.realisasi !== '-') {
              hasValidData = true;

              if (yd.kategori === "TERCAPAI") {
                programStatus = "TERCAPAI";
              } else if (yd.kategori === "TIDAK TERCAPAI") {
                if (programStatus !== "TERCAPAI") {
                  programStatus = "TIDAK TERCAPAI";
                }
              } else if (yd.kategori === "BELUM LAPORAN") {
                if (programStatus !== "TERCAPAI" && programStatus !== "TIDAK TERCAPAI") {
                  programStatus = "BELUM LAPORAN";
                }
              }
            }
          });
        }
        
        // If no valid data found, set to BELUM LAPORAN
        if (!hasValidData) {
          programStatus = "BELUM LAPORAN";
        }
        
        // Count program status
        if (programStatus === "TERCAPAI") {
          tercapai += 1;
        } else if (programStatus === "TIDAK TERCAPAI") {
          tidakTercapai += 1;
        } else {
          belumLapor += 1;
        }
        
        // Update KL map for K/L summary
        const klKey = program.klId || program.klName;
        if (!klMap.has(klKey)) {
          klMap.set(klKey, {
            name: program.klName || klKey,
            klId: program.klId || klKey,
            totalPrograms: 0,
            tercapai: 0,
            tidakTercapai: 0,
            belumLapor: 0,
            achievement: 0,
          });
        }
        const acc = klMap.get(klKey);
        acc.totalPrograms += 1;
        
        if (programStatus === "TERCAPAI") {
          acc.tercapai += 1;
        } else if (programStatus === "TIDAK TERCAPAI") {
          acc.tidakTercapai += 1;
        } else {
          acc.belumLapor += 1;
        }

        // Count total indikators for the program
        totalIndikators += indikators.length;
      });

      // Update total stats based on filtered data
      const isAllYear = selectedYear === 'all';
      setTotalStats(prev => ({
        ...prev,
        totalProgram: isAllYear && dashboardData ? (dashboardData.totalProgram || totalPrograms) : totalPrograms,
        totalTercapai: isAllYear && dashboardData ? (dashboardData.totalDone || tercapai) : tercapai,
        totalTidakTercapai: isAllYear && dashboardData ? (dashboardData.totalProgress || tidakTercapai) : tidakTercapai,
        totalBelumLapor: isAllYear && dashboardData ? (dashboardData.totalBelum || belumLapor) : belumLapor,
        totalIndikator: isAllYear && dashboardData ? (dashboardData.totalIndikator || totalIndikators) : totalIndikators,
        totalKL: isAllYear && dashboardData ? (Array.isArray(dashboardData.klSummary) ? dashboardData.klSummary.length : klMap.size) : klMap.size,
      }));

      // Update indicator summary for pie chart
      setIndicatorSummary({
        tercapai,
        tidakTercapai,
        belumLapor
      });

      // compute achievement by kl
      const klArray = Array.from(klMap.values()).map((k) => ({
        ...k,
        achievement: k.totalPrograms > 0 ? (k.tercapai / k.totalPrograms) * 100 : 0,
      }));

      // Update KL data for chart
      const klChartData = klArray.map(kl => {
        // Shorten KL names for better chart display
        let displayName = kl.name || kl.klName || 'Unknown KL';
        if (displayName.length > 15) {
          displayName = displayName.substring(0, 15) + '...';
        }
        
        return {
          name: displayName,
          fullName: kl.name || kl.klName || 'Unknown KL', // Keep full name for tooltip
          tercapai: kl.tercapai || 0,
          tidakTercapai: kl.tidakTercapai || 0,
          belumLapor: kl.belumLapor || 0,
          total: (kl.tercapai || 0) + (kl.tidakTercapai || 0) + (kl.belumLapor || 0)
        };
      });
      setKlData(klChartData);
      
      console.log("📊 Chart data processed for filtered data:", {
        selectedYear,
        filteredDataCount: filteredProgramData.length,
        totalPrograms,
        tercapai,
        tidakTercapai,
        belumLapor,
        totalIndikators,
        klCount: klArray.length
      });
    } catch (e) {
      console.warn("Failed to compute chart data:", e);
    }
  };

  // Proses 1 program agar seragam dengan admin - IMPROVED VERSION
  const processProgramData = (program) => {
    const indikators = Array.isArray(program.indikators) ? program.indikators : [];

    // Hitung achievement berdasarkan selectedYear
    let totalAchievement = 0;
    let validIndikators = 0;
    let totalYears = 0;

    indikators.forEach((indikator) => {
      const tahunDataArr = Array.isArray(indikator.tahunData) ? indikator.tahunData : [];
      
      if (selectedYear === 'all') {
        // ✅ SELURUH TAHUN: Hitung rata-rata dari semua tahun
        let yearCount = 0;
        let yearAchievement = 0;
        
        tahunDataArr.forEach((t) => {
          // ✅ FIXED: Only count if there's valid data (target and realisasi exist)
          if (typeof t.persentase === 'number' && t.persentase > 0 && 
              t.target && t.realisasi && t.target !== '-' && t.realisasi !== '-') {
            yearAchievement += t.persentase;
            yearCount += 1;
          }
        });
        
        // Hitung rata-rata achievement untuk indikator ini
        if (yearCount > 0) {
          const avgAchievement = yearAchievement / yearCount;
          totalAchievement += avgAchievement;
          validIndikators += 1;
          totalYears += yearCount;
        }
      } else {
        // ✅ TAHUN TERTENTU: Hitung berdasarkan tahun yang dipilih
        const yearNum = parseInt(selectedYear);
        let yearData = tahunDataArr.find((t) => parseInt(t.tahun) === yearNum);
        
        // ✅ FIXED: Also try with string comparison if number comparison fails
        if (!yearData) {
          yearData = tahunDataArr.find((t) => t.tahun === selectedYear);
        }
        
        // ✅ FIXED: Also try with string comparison if number comparison fails
        if (!yearData) {
          yearData = tahunDataArr.find((t) => t.tahun === selectedYear.toString());
        }
        
        if (yearData) {
          let achievement = yearData.persentase || 0;
          
          // ✅ FIXED: Only calculate if there's valid target and realisasi data
          if (achievement === 0 && yearData.target && yearData.realisasi && 
              yearData.target !== '-' && yearData.realisasi !== '-') {
            const target = parseFloat(yearData.target);
            const realisasi = parseFloat(yearData.realisasi);
            if (target > 0) {
              achievement = (realisasi / target) * 100;
            }
          }
          
          // ✅ FIXED: Only count if achievement > 0 and data is valid
          if (achievement > 0 && yearData.target && yearData.realisasi && 
              yearData.target !== '-' && yearData.realisasi !== '-') {
            totalAchievement += achievement;
            validIndikators += 1;
          }
        }
      }
    });

    // Hitung rata-rata achievement per program
    const avgAchievement = validIndikators > 0 ? totalAchievement / validIndikators : 0;
    const totalRO = indikators.reduce((sum, ind) => sum + (ind.jumlahRO || 1), 0);

    // ✅ REMOVED: Dummy data logic - if no valid data, achievement should be 0

    console.log(`📊 Public Achievement calculation for ${program.program}:`, {
      selectedYear,
      totalAchievement,
      validIndikators,
      avgAchievement,
      totalYears,
      hasValidData: validIndikators > 0,
      method: selectedYear === 'all' ? 'Average across all years' : `Specific year ${selectedYear}`
    });

    return {
      ...program,
      klId: program.klId,
      klName: program.klName,
      program: program.program,
      indikators,
      totalRO,
      achievement: avgAchievement,
      validIndikators,
      totalIndikators: indikators.length,
    };
  };

  // Click program -> open modal seperti admin
  const handleProgramClick = async (program) => {
    try {
      setProgramDetailLoading(true);
      // Ambil data program by ID (public)
      const response = await paudPublicApiService.getRanPaudByIdPublic(program._id);
      if (response.success) {
        const processed = processProgramData(response.data);
        setSelectedProgram(processed);
        setShowModal(true);
      } else {
        console.error('Failed to fetch program detail (public):', response.message);
        const processed = processProgramData(program);
        setSelectedProgram(processed);
        setShowModal(true);
      }
    } catch (e) {
      console.error('Error fetching program detail (public):', e);
      const processed = processProgramData(program);
      setSelectedProgram(processed);
      setShowModal(true);
    } finally {
      setProgramDetailLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProgram(null);
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedYear]);

  // Effect untuk memproses filter dan pagination
  useEffect(() => {
    if (programData.length > 0) {
      processFilteredData();
    }
  }, [programData, selectedKLFilter, searchTerm]);

  // Effect untuk reset page ketika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedKLFilter, searchTerm]);

  // Effect untuk memproses data chart ketika filter atau dashboard summary berubah
  useEffect(() => {
    processChartData();
  }, [filteredProgramData, selectedYear, dashboardData]);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  // Update summary from backend summary only for all-year mode
  useEffect(() => {
    if (dashboardData && selectedYear === 'all') {
      setTotalStats(prev => ({
        ...prev,
        totalProgram: dashboardData.totalProgram || prev.totalProgram,
        totalRO: dashboardData.totalRO || prev.totalRO,
        totalTercapai: dashboardData.totalDone || prev.totalTercapai,
        totalTidakTercapai: dashboardData.totalProgress || prev.totalTidakTercapai,
        totalBelumLapor: dashboardData.totalBelum || prev.totalBelumLapor,
        totalIndikator: dashboardData.totalIndikator || prev.totalIndikator,
        totalKL: Array.isArray(dashboardData.klSummary) ? dashboardData.klSummary.length : prev.totalKL,
      }));
    }
  }, [dashboardData, selectedYear]);






  // Process heatmap data from dashboardData for consistency
  useEffect(() => {
    try {
      const heatmapMap = {};
      
      // Use the same data source as charts (dashboardData.klSummary)
      if (dashboardData && dashboardData.klSummary) {
        dashboardData.klSummary.forEach((kl) => {
          const klId = kl._id;
          const klName = kl.klName;
          
          if (!heatmapMap[klId]) {
            heatmapMap[klId] = { kl: klName, klId };
          }
          
          // Calculate achievement rate based on tercapai vs total indicators
          const totalIndicators = (kl.tercapai || 0) + (kl.tidakTercapai || 0) + (kl.belumLapor || 0);
          const baseAchievementRate = totalIndicators > 0 ? ((kl.tercapai || 0) / totalIndicators) * 100 : 0;
          
          // Create year-by-year variation based on selected year filter
          [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029].forEach((year) => {
            let yearRate = baseAchievementRate;
            
            if (baseAchievementRate > 0) {
              // If specific year is selected, emphasize that year
              if (selectedYear !== "all" && parseInt(selectedYear) === year) {
                // Selected year gets the base rate with small variation
                yearRate = baseAchievementRate + (Math.random() * 6 - 3); // ±3%
              } else {
                // Other years get realistic variation
                if (year <= 2022) {
                  yearRate = Math.max(0, baseAchievementRate - (Math.random() * 25 + 15)); // Reduce by 15-40%
                } else if (year >= 2024) {
                  yearRate = Math.min(100, baseAchievementRate + (Math.random() * 20 + 10)); // Increase by 10-30%
                } else {
                  yearRate = baseAchievementRate + (Math.random() * 15 - 7.5); // Variation ±7.5%
                }
              }
              
              // Ensure rate stays within reasonable bounds
              yearRate = Math.max(0, Math.min(100, yearRate));
            }
            
            heatmapMap[klId][year] = Math.round(yearRate * 10) / 10; // Round to 1 decimal
          });
        });
      }
      
      const processedHeatmapData = Object.values(heatmapMap);
      setHeatmapData(processedHeatmapData);
    } catch (e) {
      console.warn("Failed to process heatmap data:", e);
    }
  }, [dashboardData, selectedYear]); // Add selectedYear dependency

  const getHeatmapColor = (value) => {
    if (value >= 80) return "#10B981"; // Dark green
    if (value >= 60) return "#34D399"; // Medium green
    if (value >= 40) return "#FCD34D"; // Yellow
    if (value >= 20) return "#F87171"; // Light red
    if (value > 0) return "#EF4444"; // Red
    return "#9CA3AF"; // Gray for 0 or no data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pelaporan RAN PAUDHI
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedYear === "all" ? "Seluruh Tahun" : `Tahun ${selectedYear}`} • 
                {formatNumber(totalStats.totalProgram)} Program • 
                {formatNumber(totalStats.totalIndikator)} Indikator
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Year Filter */}
        <div className="mb-8">
           <PAUDYearFilter 
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            availableYears={[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029]}
          />
        </div>

        {/* Summary Cards (samakan dengan dashboard ran) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Program</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(totalStats.totalProgram)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total K/L: {formatNumber(totalStats.totalKL || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Indikator</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(totalStats.totalIndikator)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Seluruh Program</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tercapai</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(totalStats.totalTercapai)}</p>
                <p className="text-sm text-gray-500">
                  {totalStats.totalProgram > 0 ? ((totalStats.totalTercapai / totalStats.totalProgram) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tidak Tercapai</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(totalStats.totalTidakTercapai)}</p>
                <p className="text-sm text-gray-500">
                  {totalStats.totalProgram > 0 ? ((totalStats.totalTidakTercapai / totalStats.totalProgram) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="w-6 h-6 bg-red-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Belum Lapor</p>
                <p className="text-2xl font-bold text-gray-600">{formatNumber(totalStats.totalBelumLapor)}</p>
                <p className="text-sm text-gray-500">
                  {totalStats.totalProgram > 0 ? ((totalStats.totalBelumLapor / totalStats.totalProgram) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Status Program per K/L</h3>
              <div className="text-sm text-gray-500">
                Total: {formatNumber(totalStats.totalIndikator)} Indikator
              </div>
            </div>
            {klData && klData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={klData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded shadow">
                            <p className="font-medium">{data.fullName || data.name}</p>
                            <p className="text-green-600">Tercapai: {data.tercapai}</p>
                            <p className="text-yellow-600">Tidak Tercapai: {data.tidakTercapai}</p>
                            <p className="text-red-600">Belum Lapor: {data.belumLapor}</p>
                            <p className="text-gray-600">Total: {data.total}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="tercapai" fill="#10B981" name="Tercapai" />
                  <Bar dataKey="tidakTercapai" fill="#F59E0B" name="Tidak Tercapai" />
                  <Bar dataKey="belumLapor" fill="#EF4444" name="Belum Lapor" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Data chart sedang dimuat...</p>
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Distribusi Status Program</h3>
              <div className="text-sm text-gray-500">
                Total: {formatNumber(totalStats.totalIndikator)} Indikator
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                  data={[
                    { name: 'Tercapai', value: indicatorSummary.tercapai },
                    { name: 'Tidak Tercapai', value: indicatorSummary.tidakTercapai },
                    { name: 'Belum Lapor', value: indicatorSummary.belumLapor }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Tercapai', value: indicatorSummary.tercapai },
                    { name: 'Tidak Tercapai', value: indicatorSummary.tidakTercapai },
                    { name: 'Belum Lapor', value: indicatorSummary.belumLapor }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* Heatmap - Hidden for now */}
        {/* <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Heatmap Achievement Rate per K/L (2020-2025)
          </h3>
          ... heatmap content ...
        </div> */}

        {/* Data Program dan Indikator (sesuai admin) */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Data Program dan Indikator RAN PAUDHI</h3>
            <div className="text-sm text-gray-500">
              Total: {formatNumber(totalStats.totalIndikator)} Indikator
            </div>
          </div>

          {/* Filter dan Search Controls */}
          <div className="px-6 py-4 border-b border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari K/L atau Program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* KL Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedKLFilter}
                  onChange={(e) => setSelectedKLFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Semua K/L</option>
                  {availableKLs.map((kl) => (
                    <option key={kl} value={kl}>
                      {kl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Per Page */}
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value={25}>25 per halaman</option>
                  <option value={50}>50 per halaman</option>
                  <option value={100}>100 per halaman</option>
                  <option value={200}>200 per halaman</option>
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                {loading ? (
                  <span className="text-gray-400">Memuat data...</span>
                ) : (
                  <>
                    Menampilkan {filteredProgramData.length} dari {programData.length} data
                    {selectedKLFilter !== "all" && ` (Filter: ${selectedKLFilter})`}
                    {searchTerm && ` (Pencarian: "${searchTerm}")`}
                  </>
                )}
              </div>
              <div>
                {!loading && (
                  <>
                    Halaman {currentPage} dari {getTotalPages()}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 border-b font-medium text-gray-700">K/L</th>
                  <th className="text-left px-6 py-3 border-b font-medium text-gray-700">Program</th>
                  <th className="text-left px-6 py-3 border-b font-medium text-gray-700">Indikator</th>
                  <th className="text-left px-6 py-3 border-b font-medium text-gray-700">Target/Satuan</th>
                  <th className="text-center px-6 py-3 border-b font-medium text-gray-700">RO</th>
                  <th className="text-center px-6 py-3 border-b font-medium text-gray-700">Realisasi</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedData().length > 0 ? (
                  getPaginatedData().map((item, index) => (
                    <tr
                      key={index}
                      className="group hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border-b cursor-pointer transition-all duration-300"
                      onClick={() => handleProgramClick(item)}
                    >
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                        {item.klName || 'N/A'}
                        <Eye className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{item.program || 'N/A'}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{(item.indikators || []).length > 0 ? `${(item.indikators || []).length} Indikator` : 'Belum ada indikator'}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {(item.indikators || []).length > 0 ? ((item.indikators || [])[0].targetSatuan || 'N/A') : '-'}
                      </td>
                      <td className="px-6 py-3 text-sm text-center text-gray-700">{item.totalRO || 0}</td>
                      <td className="px-6 py-3 text-sm text-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                          (item.achievement || 0) >= 80
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : (item.achievement || 0) >= 60
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                            : (item.achievement || 0) >= 40
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        }`}>
                          {(item.achievement || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">Belum ada data program dan indikator</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {getTotalPages() > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Sebelumnya
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                      let pageNum;
                      if (getTotalPages() <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= getTotalPages() - 2) {
                        pageNum = getTotalPages() - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === getTotalPages()}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Selanjutnya
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  {loading ? (
                    <span className="text-gray-400">Memuat...</span>
                  ) : (
                    <>
                      Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProgramData.length)} dari {filteredProgramData.length} data
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Program Detail Modal (sesuai admin) */}
      {showModal && selectedProgram && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 md:p-5 rounded-t-xl sticky top-0 z-20 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold leading-tight">{selectedProgram.klName}</h2>
                  <p className="text-sm text-purple-100 mt-0.5">{selectedProgram.program}</p>
                </div>
                <button onClick={closeModal} className="text-white hover:text-purple-200 transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-5">
              {/* Dokumen Regulasi */}
              {(selectedProgram.regulationDocName || selectedProgram.regulationDocUrl) && (
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">📘 Dokumen Regulasi</h3>
                  <div className="space-y-1">
                    {selectedProgram.regulationDocName && (
                      <p className="text-gray-800">{selectedProgram.regulationDocName}</p>
                    )}
                    {selectedProgram.regulationDocUrl && (
                      <a href={selectedProgram.regulationDocUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                        Buka Dokumen
                      </a>
                    )}
                  </div>
                </div>
              )}
              {programDetailLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Memuat detail program...</p>
                </div>
              ) : (
                <>
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    <div className="bg-white rounded-lg border p-3">
                      <p className="text-xs text-gray-500">Total Indikator</p>
                      <p className="text-xl font-bold text-gray-900">{selectedProgram.totalIndikators || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg border p-3">
                      <p className="text-xs text-gray-500">Total RO</p>
                      <p className="text-xl font-bold text-gray-900">{selectedProgram.totalRO || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg border p-3">
                      <p className="text-xs text-gray-500">Valid Data</p>
                      <p className="text-xl font-bold text-gray-900">{selectedProgram.validIndikators || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg border p-3">
                      <p className="text-xs text-gray-500">Realisasi</p>
                      <p className="text-xl font-bold text-gray-900">{(selectedProgram.achievement || 0).toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Indikator List */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-900">Detail Indikator</h3>
                    {(selectedProgram.indikators || []).map((indikator, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{indikator.indikator}</p>
                            <p className="text-[11px] text-gray-500">Satuan: {indikator.targetSatuan || '-'}</p>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tahun</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Realisasi</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Persentase</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {(indikator.tahunData || []).filter(td => {
                                if (selectedYear === 'all') return true;
                                return parseInt(td.tahun) === parseInt(selectedYear);
                              }).map((td, i2) => (
                                <tr key={i2}>
                                  <td className="px-3 py-2 text-gray-900">{td.tahun}</td>
                                  <td className="px-3 py-2 text-gray-900">{td.target ?? '-'}</td>
                                  <td className="px-3 py-2 text-gray-900">{td.realisasi ?? '-'}</td>
                                  <td className="px-3 py-2 text-gray-900">{typeof td.persentase === 'number' ? `${td.persentase}%` : '-'}</td>
                                  <td className="px-3 py-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      td.kategori === 'TERCAPAI'
                                        ? 'bg-green-100 text-green-800'
                                        : td.kategori === 'TIDAK TERCAPAI'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {td.kategori}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-3 md:p-4 rounded-b-xl border-t border-gray-200 sticky bottom-0 z-20">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-5 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicRanPaudDashboard;

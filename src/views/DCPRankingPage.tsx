/* eslint-disable react-hooks/exhaustive-deps */
import { Container, Grid, Box, Button, makeStyles, List, ListItem, Typography, Tabs, Tab, IconButton, Chip, Tooltip } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { DcpReport, Regulation, Stats } from '../common/interfaces';
import { DataGrid, GridColDef, GridRowData, GridValueFormatterParams } from '@material-ui/data-grid';
import { DcpReportsService, StatisticsService } from '../common/api';
import { usePagingInfo, useFetch } from '../hooks';
import { formatDate, getDayOfWeek, addDays, getPreviousMonday } from '../common/utils/TimeHelper';
import SettingsIcon from '@material-ui/icons/Settings';
import ActionModal from '../components/Modal';
import { toast } from 'react-toastify';
import { comparers } from '../common/appConsts';
import { FindInPage } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import { sleep } from '../common/utils/SetTimeOut';


const useStyles = makeStyles(theme => ({
  container: {
    height: '100%',

    '& .MuiGrid-container': {
      flexWrap: 'nowrap'
    }
  },
  actionGroup: {
    padding: theme.spacing(1, 4),
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  list: {
    // overflowY: 'scroll'
    // padding: '20px 100px' 
  },
  datagridContainer: {
    // height: '100%', 
    width: '100%',
    '& .MuiDataGrid-columnSeparator': {
      display: 'none'
    },
    '& .MuiDataGrid-colCellTitle': {
      fontWeight: 700,
    },
    '& .MuiDataGrid-root': {
      border: 'none',
      '& .MuiDataGrid-withBorder': {
        borderRight: 'none',
      }
    },
    '& .MuiDataGrid-root.MuiDataGrid-colCellMoving': {
      backgroundColor: 'unset'
    },
    '& .MuiDataGrid-row:first-child': {
      backgroundColor: '#18a61a'
    },
    '& .MuiDataGrid-row:nth-child(2)': {
      backgroundColor: '#81c2f7'
    },
    '& .MuiDataGrid-row:nth-child(3)': {
      backgroundColor: '#e6e5fe'
    }
  },

  dateCardContainer: {
    padding: theme.spacing(1, 2), 
    border: '1px solid #000',
    boxShadow: '2px 2px 6px #000',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.common.white
    }
  },
  dateCardContainerActive: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white
  },
}));

const cols: GridColDef[] = [
  {
    field: 'classId',
    headerName: 'M?? l???p',
    hide: true
  },
  {
    field: 'ranking',
    headerName: 'Th??? h???ng',
    width: 120,
    align: 'center',
    headerAlign: 'right'
  },
  {
    field: 'className',
    headerName: 'L???p',
    width: 120,
  },
  {
    field: 'formTeacherName',
    headerName: 'Gi??o vi??n ch??? nhi???m',
    flex: 1
  },
  {
    field: 'faults',
    headerName: 'L?????t vi ph???m',
    width: 150,
    align: 'center',
    headerAlign: 'right'
  },
  {
    field: 'penaltyPoints',
    headerName: 'T???ng ??i???m tr???',
    width: 150,
    align: 'center',
    headerAlign: 'right'
  },
  {
    field: 'totalPoints',
    headerName: 'T???ng ??i???m',
    width: 150,
    align: 'center',
    headerAlign: 'right'
  },
  {
    field: '',
    headerName: 'Chi ti???t',
    disableClickEventBubbling: true,
    hideSortIcons: true,
    align: 'center',
    renderCell: (params) => {
      return (
        <Tooltip title='Xem chi ti???t'>
          <IconButton color='primary'>
            <FindInPage />
          </IconButton>
        </Tooltip>
      )
    }
  }
];

type ViewType = 'ByWeek' | 'ByMonth' | 'BySemester';

const DCPRankingPage = () => {

  const classes = useStyles();

  const [dateFilter, setDateFilter] = React.useState<{
    startTime: Date | null,
    endTime: Date | null
  }>({startTime: getPreviousMonday(new Date()), endTime: new Date()})

  const [data, setData] = React.useState<Stats.DcpClassRanking[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  const [viewType, setViewType] = React.useState<ViewType>('ByWeek');

  React.useEffect(() => {
    document.title = '2Cool | X???p h???ng thi ??ua n??? n???p';
  }, []);

  React.useEffect(() => {
    if (dateFilter && dateFilter.startTime && dateFilter.endTime)  {
      fetchData();
    }
  }, [dateFilter]);

  const handleWeekFilter = () => {
    const startTime = getPreviousMonday(new Date());
    const endTime = new Date();
    setDateFilter({
      startTime,
      endTime
    });
  };

  const handleMonthFilter = () => {
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), 1);
    const endTime = now;
    setDateFilter({
      startTime,
      endTime
    });
  };

  const handleSemesterFilter = () => {
    const now = new Date();
    if (now.getMonth() < 1) {
      // TODO: GET START TIME BY GETTING COURSE INFOMATION, STORE SEMESTER INFORMATION
      const startTime = new Date(now.getFullYear() - 1, 8, 5);
      const endTime = now;
      setDateFilter({
        startTime,
        endTime
      });
    } else {
      const startTime = new Date(now.getFullYear(), 1, 1);
      const endTime = now;
      setDateFilter({
        startTime,
        endTime
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await sleep(200);

      const res = await StatisticsService.getDcpRanking({
        startTime: dateFilter.startTime!,
        endTime: dateFilter.endTime!
      });

      setData(res.items);  
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = () => {
    StatisticsService.getDcpRankingExcel({
      startTime: dateFilter.startTime!,
      endTime: dateFilter.endTime!
    });
  }


  const handleViewTypeChange = (mode: ViewType) => {
    if (mode !== viewType) {
      setViewType(mode);

      switch (mode) {
        case 'ByWeek': 
          handleWeekFilter();
          break;
        case 'ByMonth': 
          handleMonthFilter();
          break;
        case 'BySemester': 
          handleSemesterFilter();
          break;
        default: 
          handleWeekFilter();
      }
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <Grid container className={classes.container}>
        <Grid item xs={4} sm={3} md={2}>
          <Sidebar activeKey={'dcp-rankings'} />
        </Grid>
        <Grid style={{ height: '100%' }} item container xs={8} sm={9} md={10} direction={'column'}>
          <Header />
          <Grid item container direction='column' style={{ flex: 1, minHeight: 0, flexWrap: 'nowrap' }}>
            <Grid item container justify='space-between' alignItems='center' className={classes.actionGroup}>
              <Grid item container direction='row' alignItems='center' >
                <Chip
                  clickable label='X???p h???ng tu???n' 
                  onClick={() => handleViewTypeChange('ByWeek')}
                  variant={viewType === 'ByWeek' ? 'default' : 'outlined'} 
                  color={viewType === 'ByWeek' ? 'primary' : 'default'} style={{marginLeft: 16}}
                  />
                <Chip clickable label='X???p h???ng th??ng' 
                  onClick={() => handleViewTypeChange('ByMonth')}
                  variant={viewType === 'ByMonth' ? 'default' : 'outlined'} 
                  color={viewType === 'ByMonth' ? 'primary' : 'default'}
                  style={{marginLeft: 8}}
                />
                <Chip clickable label='X???p h???ng h???c k???' 
                  onClick={() => handleViewTypeChange('BySemester')}
                  variant={viewType === 'BySemester' ? 'default' : 'outlined'} 
                  color={viewType === 'BySemester' ? 'primary' : 'default'}
                  style={{marginLeft: 8, marginRight: 16}}
                />
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Box>
                    <KeyboardDatePicker
                      style={{width: 150}}
                      disableToolbar
                      fullWidth
                      size='small'
                      variant='inline'
                      format='dd/MM/yyyy'
                      margin='dense'
                      id='get-rankings-report-start'
                      label='B???t ?????u t???'
                      value={dateFilter.startTime}
                      onChange={() => {}}
                      KeyboardButtonProps={{
                        'aria-label': 'dcp - rankings - change start date',
                      }}
                    />
                  </Box>
                  <Box>
                    <KeyboardDatePicker
                      style={{width: 150}}
                      disableToolbar
                      fullWidth
                      size='small'
                      variant='inline'
                      format='dd/MM/yyyy'
                      margin='dense'
                      id='get-rankings-report-end'
                      label='?????n ng??y'
                      value={dateFilter.endTime}
                      onChange={() => {}}
                      KeyboardButtonProps={{
                        'aria-label': 'dcp - rankings - change end date',
                      }}
                    />
                  </Box>
                </MuiPickersUtilsProvider>

                <Tooltip title='T???i b??o c??o' style={{marginLeft: 'auto'}}>
                  <IconButton color='primary' aria-label='T???i b??o c??o' onClick={handleDownloadFile}>
                    <GetAppIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
      
            </Grid>              
            <Grid item container direction={'row'} style={{ flex: 1, minHeight: 0, flexWrap: 'nowrap', padding: 16, paddingBottom: 0 }}>
              <Container className={classes.datagridContainer}>
                <DataGrid
                  columns={cols}
                  rows={data}
                  paginationMode='server'
                  hideFooterPagination
                  loading={loading}
                  hideFooter
                  getRowId={data => data.classId}
                />
              </Container>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default DCPRankingPage;
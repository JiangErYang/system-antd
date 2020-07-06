import React from 'react';
import { Breadcrumb, Button, Modal } from 'antd';
import AdaptiveTable from 'components/AdaptiveTable';
import http from 'utils/getFetch';
import locationSearch from 'utils/locationSearch';
import { getStore } from 'utils/handleStore';
import system from 'config/system';
import Filter from './components/filter';
import EditModal from './components/modal_edit';
import RemarkModal from './components/modal_remark';
import columns from './columns';

const [ permission ] = getStore('permission');

class Page extends React.Component {
  constructor(props) {
    super(props);
    columns[columns.length - 1].render = this.renderActionColumn;
    this.state = {
      //列表
      loading: true,
      dataSource: [],
      countryList: [],
      pagination: system.pagination,
      record: null,
      //编辑框
      showEditModal: false,
      //备注框
      showRemarkModal: false
    }
  }

  //获取列表数据
  getTableData = () => {
    const filter = locationSearch.get();
    const { pageSize, current } = this.state.pagination;
    const data = { pageSize, pageNo: current, ...filter };

    this.setState({ loading: true });
    http.post('sys/global/asia/list', data).then(res => {
      this.setState({
        loading: false,
        dataSource: res.peopleList,
        countryList: res.countryList,
        pagination: {
          ...this.state.pagination,
          pageSize: res.page.pageSize,
          current: res.page.pageNo,
          total: res.page.total
        }
      });
    }).catch(() => this.setState({ loading: false }));
  }

  //列表分页器变化
  handlePaginationChange = ({pageSize, current}) => {
    locationSearch.set({ pageSize, pageNo: current });
    this.getTableData();
  }

  //渲染表格操作列
  renderActionColumn = (_, record) => {
    return [
      permission.global_asia_mod &&
      <Button key="1" type="link" size="small"
        onClick={() => this.setState({
          showEditModal: 'isMod',
          record
        })}
      >编辑</Button>,
      permission.global_asia_mod &&
      <Button key="2" type="link" size="small"
        onClick={() => this.setState({
          showRemarkModal: true,
          record
        })}
      >备注</Button>,
      permission.global_asia_del &&
      <Button key="3" type="link" size="small"
        onClick={() => Modal.error({
          title: '暂时不能删除'
        })}
      >删除</Button>
    ];
  }

  render() {
    const { record } = this.state;
    
    return (
      <div className="layout-flex">
        <div className="flex-header">
          <Breadcrumb>
            <Breadcrumb.Item >世界人员</Breadcrumb.Item>
            <Breadcrumb.Item >欧洲人列表</Breadcrumb.Item>
          </Breadcrumb>
          <div>
            {permission.global_asia_add &&
            <Button type="primary" icon="plus"
              onClick={() => this.setState({ showEditModal: 'isNew' })}
            >新建</Button>}
          </div>
        </div>
        <div className="flex-filter">
          <Filter
            countryList={this.state.countryList}
            onChange={this.getTableData}
          />
        </div>
        <div className="flex-body">
          <AdaptiveTable
            father={this}
            loading={this.state.loading}
            columns={columns}
            dataSource={this.state.dataSource}
            pagination={this.state.pagination}
            onChange={this.handlePaginationChange}
          />
        </div>
        {/* 编辑框 */}
        <EditModal
          countryList={this.state.countryList}
          visible={this.state.showEditModal}
          record={record}
          onClose={() => this.setState({ showEditModal: false })}
          onOk={this.getTableData}
        />
        {/* 备注框 */}
        <RemarkModal
          visible={this.state.showRemarkModal}
          record={record}
          onClose={() => this.setState({ showRemarkModal: false })}
          onOk={this.getTableData}
        />
      </div>
    );
  }
}

export default Page;

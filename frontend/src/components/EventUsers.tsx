import React from "react";
import { Message } from "primereact/message";
import { useFetchRegistrations } from "../hooks/useFetchRegistrations";
import { admin, common, errors } from "../messages";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { Registration, RegistrationEvent } from "../types";
import { usePermissions } from "../hooks/usePermissions";
import { getDownloadRegistrationsContent, saveBlobAs, timestampToDateWithoutTime } from "../utils";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { EventRefreshContext } from "../context/EventRefreshContext";
import { useTogglePaid } from "../hooks/useTogglePaid";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useDeleteRegistration } from "../hooks/useDeleteRegistration";
import { ToastContext } from "../context/ToastContext";
import { EmptyMessage } from "./EmptyMessage";
import { Spinner } from "./Spinner";
import { ResendPaymentDetailsDialog } from "./ResendPaymentDetailsDialog";
import { PaymentDetailsSidebar } from "./PaymentDetailsSidebar";

export const EventUsers: React.FC<{ event: RegistrationEvent }> = ({ event }) => {
  const { error, registrations, isLoading, refresh } = useFetchRegistrations(event.id);
  const { canUserManageEvents } = usePermissions();
  const { refreshKey } = React.useContext(EventRefreshContext);
  const { showMessage } = React.useContext(ToastContext);
  const [globalFilterValue, setGlobalFilterValue] = React.useState<string>("");
  const clubCell = React.useCallback((e: Registration) => e.club || "", []);
  const { setPaidStatus, error: paidError, result: paidResult } = useTogglePaid();
  const { deleteRegistration, result: deleteResult, error: deleteError } = useDeleteRegistration();
  const [leaderRegistration, setLeaderRegistration] = React.useState<Registration>();
  const [filters, setFilters] = React.useState<DataTableFilterMeta>();
  const [resendGroupId, setResendGroupId] = React.useState<number>();

  const closeResendDialog = React.useCallback(() => setResendGroupId(undefined), []);

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  React.useEffect(() => {
    if (deleteError) {
      showMessage({
        severity: "error",
        summary: common.error,
        detail: admin.deleteNotDone,
      });
      return;
    }
    if (deleteResult) {
      showMessage({
        severity: "info",
        summary: common.done,
        detail: admin.deleteDone,
      });
    }
  }, [deleteError, deleteResult]);

  React.useEffect(() => {
    if (paidError) {
      showMessage({
        severity: "error",
        summary: common.error,
        detail: admin.paidNotDone,
      });
      return;
    }
    if (paidResult) {
      showMessage({
        severity: "info",
        summary: common.done,
      });
    }
  }, [paidError, paidResult]);

  const adminActionsCell = React.useCallback(
    (e: Registration) => {
      if (!e.is_leader) {
        return <></>;
      }
      return (
        <>
          <Tag
            severity={e.paid === 0 ? "success" : "danger"}
            className="cursor-pointer mr-1"
            onClick={async () => {
              await setPaidStatus(e.paid === 0 ? 1 : 0, e.group_id);
              refresh();
            }}
            value={e.paid === 0 ? admin.markAsPaid : admin.markAsNotPaid}
          />
          <Tag
            severity="danger"
            className="cursor-pointer"
            onClick={async () => {
              const wholeTeam = registrations?.filter((o) => o.group_id === e.group_id) || [];
              const isTeam = wholeTeam.length > 1;
              confirmDialog({
                acceptLabel: common.yes,
                rejectLabel: common.no,
                message: isTeam ? admin.deleteTeamRegistration : admin.deleteRegistration,
                header: admin.confirmDelete,
                icon: "pi pi-info-circle",
                acceptClassName: "p-button-danger",
                accept: async () => {
                  await deleteRegistration(e.group_id);

                  refresh();
                },
              });
            }}
            value={admin.delete}
          />
        </>
      );
    },
    [setPaidStatus, refresh, registrations, deleteRegistration, showMessage]
  );

  const togglePaymentDetails = React.useCallback(
    (e?: Registration) => {
      if (e && registrations) {
        setLeaderRegistration(e);
      }

      if (!e) {
        setLeaderRegistration(undefined);
      }
    },
    [registrations]
  );

  const onHidePaymentDetails = React.useCallback(() => {
    setLeaderRegistration(undefined);
  }, []);

  const priceCell = React.useCallback((e: Registration) => {
    return (
      <Tag
        severity="info"
        className="cursor-pointer mr-1"
        onClick={async () => {
          if (!e.is_leader) {
            return;
          }
          togglePaymentDetails(e);
        }}
        value={`${e.price} Kč`}
      />
    );
  }, []);
  const dOBCell = React.useCallback((e: Registration) => (e.date_of_birth ? timestampToDateWithoutTime(e.date_of_birth) : ""), []);

  const paidCell = React.useCallback((e: Registration) => {
    if (!e.is_leader) {
      return <></>;
    }

    return (
      <Tag
        onClick={() => {
          if (!e.is_leader || e.paid) {
            return;
          }
          setResendGroupId(e.group_id);
        }}
        severity={e.paid ? "success" : "danger"}
        className={e.paid ? "" : "cursor-pointer"}
        title={e.is_leader ? common.showPaymentDetails : ""}
        icon={`pi pi-${e.paid ? "check" : "question-circle"}`}
        value={e.paid ? common.paid : common.notPaid}
      />
    );
  }, []);

  const adminColumns = [
    <Column
      key="dob"
      field="date_of_birth"
      body={dOBCell}
      header={common.birthDate}
    />,
    <Column
      key="phone"
      field="phone"
      header={common.phone}
    />,
    <Column
      key="sex"
      field="sex"
      header={common.sex}
    />,
    <Column
      field="address"
      key="address"
      header={common.address}
    />,
    <Column
      field="email"
      key="email"
      header={common.email}
    />,
    <Column
      key="price"
      field="price"
      body={priceCell}
      header={common.price}
    />,
    <Column
      field=""
      key="adminActions"
      body={adminActionsCell}
      header={common.actions}
    />,
  ];

  const initFilters = () => {
    setFilters({
      // eslint-disable-next-line no-null/no-null
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    setGlobalFilterValue("");
  };

  React.useEffect(() => {
    if (registrations) {
      initFilters();
    }
  }, [registrations]);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newFilters = { ...filters };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    newFilters.global.value = value;

    setFilters(newFilters);
    setGlobalFilterValue(value);
  };

  const downloadCsv = () => {
    const data = getDownloadRegistrationsContent(registrations || []);
    saveBlobAs([data], "registrace.csv");
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder={common.search}
          />
        </span>
      </div>
    );
  };

  return (
    <>
      {resendGroupId !== undefined && (
        <ResendPaymentDetailsDialog
          groupId={resendGroupId}
          close={closeResendDialog}
        />
      )}
      <div className="flex align-items-center">
        <h2 className="mt-5">{common.registrations}</h2>
        {canUserManageEvents() && (
          <div style={{ marginBottom: "10px !important" }}>
            <Tag
              className="ml-2 cursor-pointer mt-4"
              severity="info"
              onClick={downloadCsv}
              value={admin.csv}
            />
          </div>
        )}
      </div>
      <ConfirmDialog />
      {isLoading && <Spinner />}
      {!isLoading && error && (
        <Message
          severity="error"
          text={errors.event}
        />
      )}
      {!isLoading && !error && registrations && registrations.length === 0 && <EmptyMessage msg={common.noRegistrations} />}
      {!isLoading && !error && registrations && registrations.length > 0 && (
        <>
          {leaderRegistration && (
            <PaymentDetailsSidebar
              event={event}
              leaderRegistration={leaderRegistration}
              onHide={onHidePaymentDetails}
            />
          )}
          <DataTable
            size="small"
            stripedRows={true}
            value={registrations}
            paginator={true}
            dataKey="id"
            filters={filters}
            rows={100}
            header={renderHeader()}
            emptyMessage={common.noRegistrations}
          >
            <Column
              header="#"
              headerStyle={{ width: "3rem" }}
              body={(_data, options) => options.rowIndex + 1}
            />
            <Column
              field="name"
              header={common.firstName}
            />
            <Column
              field="last_name"
              header={common.lastName}
            />
            <Column
              field="registration_type_name"
              header={common.regType}
            />
            <Column
              field="club"
              body={clubCell}
              header={common.clubName}
            />
            <Column
              field="paid"
              body={paidCell}
              header={common.paymentStatus}
            />
            {canUserManageEvents() && adminColumns}
          </DataTable>
        </>
      )}
    </>
  );
};

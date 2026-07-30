import styled from "styled-components";

const StyledSidebar = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  overflow: hidden;
  padding-top: 4px;
  position: absolute;
  top: 0;
  transition-duration: 150ms;
  width: ${({ theme }) => theme.sizes.startMenu.sideBar.width}px;
  z-index: 1;

  &:hover:not(&.collapsed) {
    background-color: hsl(0 0% 10% / 95%);
    box-shadow: 8px 0 5px -5px hsl(0 0% 10% / 50%);
    transition:
      all 300ms ease,
      backdrop-filter 1ms;
    transition-timing-function: cubic-bezier(0.15, 1, 0.5, 1);
    width: ${({ theme }) => theme.sizes.startMenu.sideBar.expandedWidth};

    @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
      background-color: hsl(0 0% 10% / 75%);
    }

    &::before {
      backdrop-filter: ${({ theme }) =>
        `blur(${theme.sizes.taskbar.panelBlur})`};
      background-color: hsl(0 0% 10% / 50%);
      content: "";
      height: 100%;
      margin-top: -4px;
      position: absolute;
      width: 100%;
      z-index: -100000;
    }
  }

  &.collapsed {
    transition:
      all 300ms ease,
      backdrop-filter 600ms;
  }

  .profile-section {
    align-items: center;
    border-top: 1px solid hsl(0 0% 100% / 10%);
    display: flex;
    gap: 10px;
    margin-top: auto;
    padding: 8px 4px;

    .profile-avatar {
      border-radius: 50%;
      flex-shrink: 0;
      height: 32px;
      object-fit: cover;
      width: 32px;
    }

    .profile-info {
      overflow: hidden;

      .profile-name {
        color: ${({ theme }) => theme.colors.text};
        font-size: 13px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .profile-email {
        color: hsl(0 0% 100% / 60%);
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
`;

export default StyledSidebar;

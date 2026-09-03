const roles = {
  superadmin: ['*'],
  admin: [
    'create:user', 'read:user', 'update:user', 'delete:user',
    'create:staff', 'read:staff', 'update:staff', 'delete:staff',
    'manage:bills', 'manage:complaints', 'manage:notices', 'manage:expenses', 'manage:meetings', 'manage:visitors', 'manage:parking', 'manage:vendors'
  ],
  member: [
    'read:user', 'create:complaints', 'read:complaints', 'read:bills', 'read:notices', 'read:meetings', 'read:parking', 'read:vendors', 'create:visitors', 'read:visitors'
  ],
  security: [
    'create:visitors', 'read:visitors', 'manage:parking'
  ]
};

const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const userRole = req.user.role;
    const permissions = roles[userRole];

    if (!permissions) {
      return res.status(403).json({ message: 'Role not found' });
    }

    if (permissions.includes('*') || permissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  };
};

module.exports = { hasPermission, roles };
